const mysql = require('mysql2/promise');
require('dotenv').config();

async function tabloyuKur() {
    const baglanti = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log("✈️ Bulut veritabanına bağlanıldı, tablo oluşturuluyor...");

    const sqlSorgusu = `
        CREATE TABLE IF NOT EXISTS kullanici_limitleri (
            ip_adresi VARCHAR(100) NOT NULL,
            kullanim_sayisi INT NOT NULL DEFAULT 0,
            son_kullanim_tarihi DATE NOT NULL,
            PRIMARY KEY (ip_adresi, son_kullanim_tarihi)
        );
    `;

    await baglanti.query(sqlSorgusu);
    console.log("✅ 'kullanici_limitleri' tablosu bulutta başarıyla oluşturuldu!");
    await baglanti.end();
}

tabloyuKur().catch(console.error);