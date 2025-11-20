const cron = require('node-cron');
require('dotenv').config();
const { sendText, sendTemplate } = require('./whatsapp');
const { getTodayMessage } = require('./services/dailyContent');
const { getRecipients } = require('./services/recipientsStore');

const USE_UNOFFICIAL = String(process.env.USE_UNOFFICIAL || '').toLowerCase() === 'true';
let waweb;
if (USE_UNOFFICIAL) {
  try {
    waweb = require('./unofficial/wa');
  } catch (e) {
    console.error('whatsapp-web.js modülü yüklenemedi. `npm install` çalıştırmayı deneyin.');
  }
}

const TZ = process.env.TIMEZONE || 'Europe/Istanbul';

async function sendDailyToAll() {
  const { plainText, template } = await getTodayMessage();

  if (USE_UNOFFICIAL) {
    const groupName = process.env.GROUP_NAME;
    if (!groupName) {
      console.error('GROUP_NAME .env içinde ayarlanmalı.');
      return;
    }
    try {
      await waweb.ensureReady();
      await waweb.sendToGroupName(groupName, plainText);
      console.log(`[ok] Grup mesajı gönderildi: ${groupName}`);
    } catch (err) {
      console.error('[fail] Grup mesajı:', err?.message || err);
    }
    return;
  }

  const recipients = getRecipients();
  for (const to of recipients) {
    try {
      if (template) {
        const { name, langCode = 'tr', components = [] } = template;
        await sendTemplate(to, name, langCode, components);
      } else {
        await sendText(to, plainText);
      }
      console.log(`[ok] Sent daily message to ${to}`);
    } catch (err) {
      console.error(`[fail] ${to}:`, err?.response?.data || err.message);
    }
  }
}

// Schedule: every day at 09:00 local TZ
function scheduleDaily() {
  cron.schedule('0 9 * * *', sendDailyToAll, { timezone: TZ });
  console.log(`Daily schedule set for 09:00 (${TZ}).`);
}

module.exports = {
  scheduleDaily,
  sendDailyToAll
};
