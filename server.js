const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { YoutubeTranscript } = require('youtube-transcript');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mysql = require('mysql2/promise');

const app = express();

// 🚨 GÜVENLİK YAMASI 1: Dinamik Port
const port = process.env.PORT || 3000;

// --- 1. SIRA: GÜVENLİK VE ORTAK AYARLAR (MIDDLEWARE) ---
app.set('trust proxy', 1);
app.use(cors({ origin: '*' })); 
app.use(express.json());

// --- 2. SIRA: VERİTABANI BAĞLANTISI ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.getConnection()
    .then(() => console.log("📦 MySQL Veritabanına başarıyla bağlanıldı!"))
    .catch((hata) => console.error("❌ Veritabanı bağlantı hatası:", hata));

// --- 3. SIRA: YAPAY ZEKA BAĞLANTISI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- 4. SIRA: ROTALAR (API UÇ NOKTALARI) ---

// Sanal bekçinin (UptimeRobot) sistemi uyanık tutması için
app.get('/api/ping', async (req, res) => {
    try {
        await db.query('SELECT 1'); 
        res.status(200).send('Motor ve Veritabanı 7/24 Ayakta! 🚀');
    } catch (error) {
        console.error(error);
        res.status(500).send('Veritabanı uykuda veya hatalı.');
    }
});

// Asıl İşlemi Yapan API Uç Noktası
app.post('/api/ozetle', async (req, res) => {
    const link = req.body.videoLink;
    const modlar = req.body.mod;
    const ceviri = req.body.ceviri;

    if (!link || (!link.includes('youtube.com') && !link.includes('youtu.be'))) {
        return res.status(400).json({ basari: false, mesaj: "Lütfen geçerli bir YouTube URL'si yapıştırın." });
    }

    const musteriIp = req.ip || req.socket.remoteAddress;

    try {
        const [satirlar] = await db.query(
            "SELECT * FROM kullanici_limitleri WHERE ip_adresi = ? AND son_kullanim_tarihi = CURDATE()",
            [musteriIp]
        );

        if (satirlar.length > 0 && satirlar[0].kullanim_sayisi >= 3) {
            console.log(`⛔ Limit doldu: ${musteriIp}`);
            return res.status(429).json({ basari: false, mesaj: "Günlük ücretsiz 3 kullanım limitinizi doldurdunuz. Lütfen yarın tekrar gelin." });
        }

        console.log("1. YouTube linki temizleniyor...");
        
        // --- VİDEO ID ÇIKARICI FİLTRE ---
        let videoId = link;
        if (link.includes("youtu.be/")) {
            videoId = link.split("youtu.be/")[1].split("?")[0];
        } else if (link.includes("watch?v=")) {
            videoId = link.split("v=")[1].split("&")[0];
        } else if (link.includes("shorts/")) {
            videoId = link.split("shorts/")[1].split("?")[0];
        }

        console.log(`2. Temiz ID bulundu: ${videoId} | Alt yazılar çekiliyor...`);
        // Kütüphaneye karmaşık linki değil, sadece saf ID'yi veriyoruz
        const transcriptDizisi = await YoutubeTranscript.fetchTranscript(videoId);
        const duzMetin = transcriptDizisi.map(item => item.text).join(' ');
        
        let prompt = "";
        if (modlar === "tldr") {
            prompt = "Bu videonun detaylarına girmeden, anlatılmak istenen asıl mesajı en fazla 2 veya 3 cümleyle, çok net bir şekilde özetle. Metin: " + duzMetin;
        } else if (modlar === "adim_adim") {
            prompt = "Bu videodaki süreci eyleme dökülebilir, sırasıyla takip edilecek net adımlar (1, 2, 3...) halinde listele. Gereksiz yorumları çıkar. Metin: " + duzMetin;
        } else if (modlar === "soru_cevap") {
            prompt = "Bu videoda yanıtlanan en önemli 3-4 soruyu tespit et ve bu soruları, videoda verilen cevaplarla birlikte bir 'Soru-Cevap' formatında yaz. Metin: " + duzMetin;
        } else if (modlar === "arti_eksi") {
            prompt = "Videonun içeriğine dayanarak, bahsedilen konunun/ürünün en belirgin avantajlarını (artılar) ve dezavantajlarını (eksiler) iki ayrı liste halinde sun. Metin: " + duzMetin;
        } else if (modlar === "flood") {
            prompt = "Bu videodaki ana fikirleri kullanarak, dikkat çekici ve emojilerle desteklenmiş kısa bir sosyal medya bilgi zinciri (flood) oluştur. Metin: " + duzMetin;
        } else {
            prompt = "Aşağıdaki video metnini kullanarak bana 3 maddelik bir özet çıkar: " + duzMetin;
        }

        if(ceviri == true){
            prompt += " ÖNEMLİ NOT: Orijinal video hangi dilde olursa olsun, bu sonucu KESİNLİKLE akıcı bir Türkçe ile hazırla.";
        }

        const istek = await model.generateContent(prompt); 
        
        if (satirlar.length > 0) {
            await db.query("UPDATE kullanici_limitleri SET kullanim_sayisi = kullanim_sayisi + 1 WHERE ip_adresi = ? AND son_kullanim_tarihi = CURDATE()", [musteriIp]);
        } else {
            await db.query("INSERT INTO kullanici_limitleri (ip_adresi, kullanim_sayisi, son_kullanim_tarihi) VALUES (?, 1, CURDATE())", [musteriIp]);
        }

        console.log("İŞTE SONUÇ HAZIR, KULLANICIYA GÖNDERİLİYOR.\n");
        res.json({ basari: true, veri: istek.response.text() });

    } catch (hata) {
        console.error("İşlem sırasında hata:", hata);
        res.status(500).json({ basari: false, mesaj: "Video işlenirken bir sorun oluştu. Video alt yazısız olabilir." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Sunucu port ${port} üzerinde ayakta ve istek bekliyor!`);
});