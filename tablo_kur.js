require('dotenv').config();
const mysql = require('mysql2/promise');

async function tabloyuKur() {
    try {
        // Aiven veritabanına bağlanıyoruz
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log("📦 Veritabanına girildi, tablo inşa ediliyor...");

        // Tabloyu ve sütunları oluşturan SQL komutu
        await db.query(`
            CREATE TABLE IF NOT EXISTS kullanici_limitleri (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_adresi VARCHAR(50) NOT NULL,
                kullanim_sayisi INT DEFAULT 1,
                son_kullanim_tarihi DATE NOT NULL
            )
        `);

        console.log("✅ Harika! 'kullanici_limitleri' tablosu başarıyla kuruldu.");
        process.exit(0); // İşlem bitti, terminali kapat
    } catch (hata) {
        console.error("❌ Bir hata oluştu:", hata);
    }
}

tabloyuKur();