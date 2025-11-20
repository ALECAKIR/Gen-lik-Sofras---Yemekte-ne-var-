require('dotenv').config();
const { sendDailyToAll } = require('../scheduler');

(async () => {
  await sendDailyToAll();
})();

