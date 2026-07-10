require('dotenv').config();

async function modelleriGoster() {
    const apiKey = process.env.GEMINI_API_KEY;
    // Google'ın modelleri listelediği adres
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log("Google'a bağlanılıyor ve modeller listeleniyor...\n");
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log("✅ KULLANABİLECEĞİN MODELLER:");
            data.models.forEach(model => {
                // Sadece metin üretebilen modelleri (generateContent destekleyenleri) filtreleyelim
                if (model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name}`);
                }
            });
        } else {
            console.log("Liste alınamadı, API yanıtı:", data);
        }

    } catch (hata) {
        console.error("Bağlantı hatası:", hata);
    }
}

modelleriGoster();