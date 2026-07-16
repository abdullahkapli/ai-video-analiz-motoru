# 🚀 AI Destekli YouTube Video Analiz ve Özetleme Motoru BriefTube AI

Bu proje, YouTube videolarının alt yazılarını asenkron olarak çekip, Google Gemini AI kullanarak kullanıcılara saniyeler içinde anlamlı özetler sunan Full-Stack bir web uygulamasıdır. 

Kullanıcıların sistemi kötüye kullanımını engellemek amacıyla **Aiven Bulut MySQL** üzerinde çalışan IP tabanlı bir Rate-Limiting (İstek Sınırlandırma) mimarisi kurgulanmıştır.


## 🛠️ Kullanılan Teknolojiler

* **Frontend (Ön Yüz):** HTML5, CSS3, Vanilla JavaScript, Fetch API
* **Backend (Arka Yüz):** Node.js, Express.js
* **Veritabanı:** MySQL (Aiven Cloud) - *IP Loglama ve İstek Sınırlandırma için*
* **Yapay Zeka:** Google Generative AI (Gemini Pro)
* **Veri Çekme:** `youtube-transcript` (Web Scraping)

## ⚙️ Sistem Mimarisi ve Akışı

1. Kullanıcı YouTube linkini ön yüzden gönderir. Link, özel bir filtreleme fonksiyonundan geçerek (parametrelerden temizlenerek) saf Video ID'sine dönüştürülür.
2. Express sunucusu, kullanıcının IP adresini Aiven MySQL veritabanında sorgular. Günlük 5 istek limiti aşılmamışsa işleme onay verilir.
3. Node.js, YouTube üzerinden videonun Transcript (Alt yazı) verilerini çeker.
4. Elde edilen ham metin, özel bir prompt (talimat) ile Google Gemini API'ye iletilir ve özetlenmiş, yapılandırılmış veri ön yüze JSON formatında döndürülür.

## 📌 Geliştirme Notları ve Bulut Kısıtlamaları (Architecture Notes)

Projenin geliştirilme aşamasında sistem başarıyla bulut ortamına (Render) deploy edilmiş ve veritabanı bağlantıları (Aiven) canlıya alınmıştır. Ancak sistem mimarisi test edilirken şu kısıtlamalar tespit edilmiştir:

* **Data Center IP Ban:** YouTube'un anti-bot güvenlik politikaları gereği, bulut sunucu merkezlerinden (AWS, Render vb.) gelen toplu scraping (alt yazı çekme) istekleri "Transcript is disabled" hatası ile reddedilmektedir. 
* **Çözüm Yaklaşımı:** Bu IP kısıtlamasını aşmak için kurumsal projelerde Residential Proxy veya üçüncü parti resmi API'ler kullanılmaktadır. Projenin açık kaynak doğası ve maliyet yönetimi göz önüne alınarak, uygulamanın **Yerel Ortamda (Localhost)** sivil IP ile tam işlevsel şekilde çalıştırılması mimari olarak daha uygun bulunmuştur.

## 🚀 Kurulum (Localhost'ta Çalıştırma)

Projeyi kendi bilgisayarınızda denemek için:

1. Repoyu klonlayın:
   ```bash
   git clone(https://github.com/abdullahkapli/ai-video-analiz-motoru.git)