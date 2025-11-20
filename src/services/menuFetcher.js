const axios = require('axios');
const cheerio = require('cheerio');

const MENU_URL = 'https://forms.ankara.bel.tr/genclik-sofrasi-menu';

async function fetchMenu() {
  const { data: html } = await axios.get(MENU_URL, {
    timeout: 15000,
    headers: {
      'User-Agent': 'GenclikSofrasiBot/1.0 (+https://example.org)'
    }
  });

  const $ = cheerio.load(html);

  // Container with daily menu
  const box = $('div.alert.alert-info.text-left').first();
  if (!box || box.length === 0) {
    throw new Error('Menu container not found');
  }

  // Extract date text, e.g., "Bugün: 10.11.2025"
  const dateLine = box.find('h5').filter((_, el) => $(el).text().trim().startsWith('Bugün')).first().text().trim();
  const dateText = dateLine.replace(/^Bugün:\s*/i, '').trim();

  // List items
  const items = [];
  box.find('ul > li').each((_, li) => {
    const t = $(li).text().trim();
    if (t && t !== '-' && !/^\s*$/.test(t)) items.push(t);
  });

  return { dateText, items };
}

module.exports = { fetchMenu };

