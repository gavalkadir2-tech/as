# Güvenlik ve canlıya alma

Bu uygulama istemci tarafında çalışan bir PWA'dır. Tarayıcıda saklanan roller,
ayarlar ve oturum bilgileri güvenlik sınırı değildir; tarayıcıyı kontrol eden
biri bunları değiştirebilir. Müşteri ve finans verisi için aşağıdaki yapı
zorunludur.

## Supabase

1. Önce `supabase/schema.sql` dosyasını SQL Editor'da çalıştırın. Supabase
   Auth'ta Google sağlayıcısını etkinleştirin ve yalnızca işletmenin izinli
   kullanıcılarına erişim verin.
2. Uygulama Google kimlik belirtecini Supabase Auth ile değiştirir ve buluta
   yalnızca imzalı Supabase erişim belirteci ile bağlanır. RLS politikaları
   `auth.uid()` ile kayıt sahibini eşleştirir.
3. Anon anahtar yalnızca RLS etkin durumdayken istemcide kullanılabilir.
   `service_role` anahtarını asla tarayıcıya koymayın.

Çok kullanıcılı bir işletmede şemayı `organization_id` ile genişletin;
organizasyon üyeliğini de sunucu tarafında doğrulayın.

## Kimlik doğrulama

Google kimlik belirteci sunucuda veya Supabase Auth üzerinden doğrulanmalıdır.
Sadece JWT içeriğini tarayıcıda çözmek kimlik kanıtı değildir. Rol kontrolünü
veritabanı politikaları ve sunucu tarafı API'ler de uygulamalıdır.

## API anahtarları

Gemini anahtarını tarayıcıya koymak yerine sunucu tarafındaki bir proxy/Edge
Function kullanın. Anahtarı ortam değişkeni olarak saklayın, kota ve kullanıcı
başına istek sınırı uygulayın.

## Dağıtım kontrol listesi

- HTTPS ve bir Content-Security-Policy kullanın.
- Harici betikleri sürümü sabitlenmiş dosyalar olarak kendi alan adınızdan
  sunun; mümkünse SRI ekleyin.
- Düzenli, şifreli yedek alın ve geri yüklemeyi test edin.
- Yetkisiz erişim, veri silme ve senkronizasyon hataları için denetim kaydı
  tutun.
