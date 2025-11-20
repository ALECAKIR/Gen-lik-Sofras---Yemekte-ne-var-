require('dotenv').config();

const USE_UNOFFICIAL = String(process.env.USE_UNOFFICIAL || '').toLowerCase() === 'true';

if (!USE_UNOFFICIAL) {
  console.error('USE_UNOFFICIAL=true değil. Bu script whatsapp-web.js için tasarlanmıştır.');
  process.exit(1);
}

(async () => {
  const wa = require('../unofficial/wa');
  await wa.ensureReady();
  const client = wa.getClient();
  const chats = await client.getChats();
  const groups = chats.filter((c) => c.isGroup);
  console.log(`Toplam grup: ${groups.length}`);
  for (const g of groups) {
    console.log(`- ${g.name} | ${g.id._serialized}`);
  }
})();

