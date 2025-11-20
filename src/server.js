const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const { sendText } = require('./whatsapp');
const { addRecipient, removeRecipient } = require('./services/recipientsStore');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const { sendDailyToAll } = require('./scheduler');

app.use(bodyParser.json());

// Webhook verification (GET)
// Meta sends hub.challenge for verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Webhook receiver (POST)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // WhatsApp webhook structure
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const messages = value.messages || [];
          for (const message of messages) {
            const from = message.from; // user phone in international format
            const type = message.type;
            const text = message.text?.body;

            // Simple auto-reply demo (optional). Adjust/remove as needed.
            if (type === 'text' && text) {
              const lower = text.trim().toLowerCase();
              try {
                if (['katil','abone','start','basla'].includes(lower)) {
                  const added = addRecipient(from);
                  const reply = added
                    ? 'Kaydınız alındı. Günlük menüyü artık WhatsApp üzerinden alacaksınız.'
                    : 'Zaten kayıtlısınız. Günlük menüyü almaya devam edeceksiniz.';
                  await sendText(from, reply);
                } else if (['iptal','cik','stop','dur'].includes(lower)) {
                  const removed = removeRecipient(from);
                  const reply = removed
                    ? 'Kaydınız silindi. Günlük menü mesajları artık gönderilmeyecek.'
                    : 'Sistemde kaydınız bulunamadı.';
                  await sendText(from, reply);
                } else {
                  const reply = 'Merhaba! Abone olmak için "KATIL", iptal için "IPTAL" yazabilirsiniz.';
                  await sendText(from, reply);
                }
              } catch (e) {
                console.error('Auto-reply failed:', e?.response?.data || e.message);
              }
            }
          }
        }
      }
      return res.sendStatus(200);
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error('Webhook error:', err);
    return res.sendStatus(500);
  }
});

// Optional: trigger manual send via HTTP (require ADMIN_TOKEN)
app.post('/send-now', async (req, res) => {
  try {
    const token = req.query.token || req.headers['x-admin-token'];
    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return res.sendStatus(403);
    await sendDailyToAll();
    res.json({ ok: true });
  } catch (e) {
    console.error('/send-now error:', e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.get('/', (_req, res) => {
  res.send('Gençlik Sofrası WhatsApp botu çalışıyor. Webhook: /webhook');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
