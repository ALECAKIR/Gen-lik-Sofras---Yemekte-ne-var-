// Günlük içerik: Belediyenin menü sayfasından çek ve biçimlendir.
const { fetchMenu } = require('./menuFetcher');

function formatMenuPlain(dateText, items) {
  const header = 'Gençlik Sofrası – Günün Menüsü';
  const list = items && items.length ? items.map((x) => `• ${x}`).join('\n') : '- Güncelleniyor';
  return `${header}\nTarih: ${dateText}\n\n${list}`;
}

async function getTodayMessage() {
  try {
    const { dateText, items } = await fetchMenu();
    const plainText = formatMenuPlain(dateText || new Date().toLocaleDateString('tr-TR'), items);

    // Şablon kullanmak isterseniz aşağıyı açıp düzenleyin (onaylı template gerekli)
    // const template = {
    //   name: 'gunluk_menu_bilgi',
    //   langCode: 'tr',
    //   components: [
    //     { type: 'body', parameters: [
    //       { type: 'text', text: dateText },
    //       { type: 'text', text: (items || []).join(', ') }
    //     ]}
    //   ]
    // };

    return { plainText /*, template*/ };
  } catch (err) {
    const today = new Date().toLocaleDateString('tr-TR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const plainText = `Gençlik Sofrası günlük bilgilendirme\nTarih: ${today}\n\n- Menü bilgisi şu an alınamadı. Lütfen daha sonra tekrar deneyin.`;
    return { plainText };
  }
}

module.exports = { getTodayMessage };
