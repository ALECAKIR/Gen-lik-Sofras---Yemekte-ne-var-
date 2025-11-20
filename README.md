# Gençlik Sofrası – WhatsApp Günlük Bilgilendirme Botu

Resmi WhatsApp Cloud API ile webhook + günlük gönderim planlayıcı içeren örnek bot.

## Özellikler
- Webhook doğrulama ve mesaj alma (`/webhook`).
- Tek seferlik veya planlı (her gün 09:00, Europe/Istanbul) gönderim.
- Resmi Cloud API kullanımı (şablon ve metin mesajları).

## Hızlı Başlangıç
1) Node 18+ kurulu olmalı.
2) Meta Business / WhatsApp Cloud API yapılandırması:
   - Bir Meta uygulaması ve WhatsApp ürününü ekleyin.
   - Gönderen numaranın `Phone number ID` değerini not alın.
   - `whatsapp_business_messaging` iznine sahip kalıcı (System User) erişim tokenı alın.
   - Webhook aboneliğini açın ve `VERIFY_TOKEN` ile doğrulayın.
3) Depoyu hazırlayın:

```
cp .env.example .env
```

`.env` içinde aşağıları doldurun:
- `PHONE_NUMBER_ID`
- `WHATSAPP_TOKEN`
- `VERIFY_TOKEN`
- (opsiyonel) `GRAPH_API_VERSION=v20.0`, `TIMEZONE=Europe/Istanbul`, `PORT=3000`

4) Bağımlılıkları kurun ve başlatın:

```
npm install
npm run dev
```

Sunucu `http://localhost:3000` üzerinde çalışır. Webhook doğrulaması için `GET /webhook` kullanılır; Meta paneline bu URL’yi ve `VERIFY_TOKEN` değerini girin.

## Günlük Gönderim
- Resmi (Cloud API) mod:
  - Alıcılar: `recipients.json` dosyasına E.164 formatında (ör. `+905xx...`) numaraları girin veya kullanıcılar "KATIL" yazarak otomatik abone olabilir.
  - İçerik: Menü otomatik olarak şu sayfadan çekilir: https://forms.ankara.bel.tr/genclik-sofrasi-menu
    - Biçimlendirme ve yedek metin: `src/services/dailyContent.js`
    - Sayfa yapısı değişirse seçicileri güncelleyin: `src/services/menuFetcher.js`
    - Yayın/broadcast için şablon mesaj kullanmanız gerekiyor (24 saat kuralı). Şablon onayı aldıktan sonra örnek `template` bölümünü aktif edin.
  - Manuel gönderim: `npm run send:daily`
  - Otomatik gönderim: `src/app.js` içindeki planlayıcı her gün 09:00 (Europe/Istanbul) saatinde çalışır.

### Gayriresmi (whatsapp-web.js) grup gönderimi
- Uyarı: Bu yöntem WhatsApp kullanım koşullarıyla uyumlu değildir; hesap riski size aittir.
- Adımlar:
  1) `.env` içinde `USE_UNOFFICIAL=true` ve `GROUP_NAME=Grup Adınız` ayarlayın.
  2) Bağımlılıkları yükleyin: `npm install`
  3) Uygulamayı başlatın: `npm run dev`
  4) Terminalde çıkacak QR kodunu WhatsApp uygulamanızdan tarayın.
  5) İlk eşleşmeden sonra kimlik bilgileri `.wwebjs_auth` klasörüne kaydedilir.
- Çalışma: Planlayıcı her gün 09:00'da `GROUP_NAME` adına sahip gruba menüyü gönderir.

## Önemli Notlar
- 24 saat kuralı: Serbest metin mesajları yalnızca kullanıcı en son 24 saat içinde size yazdıysa gönderilebilir. Düzenli bilgilendirme için WhatsApp onaylı mesaj şablonları (template) kullanın.
- İzin/opt-in: Yasal olarak alıcılardan onay alın. İstenmeyen mesaj göndermeyin.
- Geliştirmede test numarası: Meta, geçici test numarası sağlar; canlıya geçince gerçek gönderen numaranızı ve şablonlarınızı kullanın.

## Dosya Yapısı
- `src/server.js`: Webhook doğrulama/alma, basit oto-yanıt örneği.
- `src/whatsapp.js`: Cloud API istekleri (metin/şablon).
- `src/scheduler.js`: Günlük gönderim işlevi ve cron planlayıcı.
- `src/services/dailyContent.js`: Günlük içerik üretimi.
- `src/services/menuFetcher.js`: ABB menü sayfası HTML ayrıştırma.
- `src/scripts/sendDaily.js`: Komut satırından tek seferlik gönderim.
- `recipients.jsaöfme gndron`: Alıcı telefon listesi (otomatik kayıt/çıkarma destekli).

## Dağıtım
- Üretimde bir sunucuya kurun (HTTPS gerekli). Webhook URL’nizi Meta paneline kaydedin.
- Token ve kimlikleri ortam değişkenleriyle güvenli yönetin.
