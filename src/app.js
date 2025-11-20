require('dotenv').config();
const { scheduleDaily } = require('./scheduler');
require('./server');

// Start the daily scheduler in this process as well
scheduleDaily();

// If unofficial mode is enabled, initialize WhatsApp Web client early
if (String(process.env.USE_UNOFFICIAL || '').toLowerCase() === 'true') {
  try {
    const { ensureReady } = require('./unofficial/wa');
    ensureReady().catch((e) => console.error('WA client init error:', e?.message || e));
  } catch (e) {
    console.error('whatsapp-web.js başlatılamadı. `npm install` ve Chrome bağımlılıklarını kontrol edin.');
  }
}
