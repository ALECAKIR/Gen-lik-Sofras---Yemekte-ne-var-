const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const EXEC_PATH = process.env.PUPPETEER_EXECUTABLE_PATH; // e.g. /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
const PUP_TIMEOUT = Number(process.env.PUPPETEER_TIMEOUT_MS || 60000);

let client;
let readyPromise;

function ensureReady() {
  if (readyPromise) return readyPromise;

  client = new Client({
    puppeteer: {
      headless: true,
      executablePath: EXEC_PATH,
      timeout: PUP_TIMEOUT,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    },
    authStrategy: new LocalAuth({ clientId: 'genclik-sofrasi' })
  });

  readyPromise = new Promise((resolve, reject) => {
    client.on('qr', (qr) => {
      console.log('WhatsApp QR kodu (telefonunuzla tarayın):');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('[waweb] Client hazır.');
      resolve(client);
    });

    client.on('auth_failure', (msg) => {
      console.error('[waweb] Kimlik doğrulama hatası:', msg);
    });

    client.on('disconnected', (reason) => {
      console.warn('[waweb] Bağlantı koptu:', reason);
    });

    client.initialize().catch(reject);
  });

  return readyPromise;
}

async function sendToGroupName(groupName, message) {
  if (!groupName) throw new Error('GROUP_NAME boş olamaz');
  const c = await ensureReady();
  const chats = await c.getChats();
  const group = chats.find((ch) => ch.isGroup && (ch.name === groupName || ch.name?.includes(groupName)));
  if (!group) throw new Error(`Grup bulunamadı: ${groupName}`);
  await c.sendMessage(group.id._serialized, message);
}

module.exports = { ensureReady, sendToGroupName };
// Expose the raw client for diagnostics
module.exports.getClient = () => client;
