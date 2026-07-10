
const { YoutubeTranscript } = require('youtube-transcript');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const link = "https://www.youtube.com/watch?v=kXKhNI4DLHM&list=RDkXKhNI4DLHM&start_radio=1";

async function altYaziyiCek() {
    try{
        console.log("1. YouTube'dan alt yazılar çekiliyor...");
        const transcriptDizisi = await YoutubeTranscript.fetchTranscript(link);

        console.log("2. Metinler birleştiriliyor...");
        const duzMetin = transcriptDizisi.map(item => item.text).join(' ');
        
        console.log("3. Yapay zekaya gönderiliyor...");
        const prompt = "Aşağıdaki video metnini kullanarak bana 3 maddelik bir özet ve kısa bir blog yazısı çıkar: " + duzMetin;
        const istek = await model.generateContent(prompt); 
        
        console.log("İŞTE SONUÇ:\n");
        res.json({ basari: true, veri: istek.response.text() });

    } catch (hata) {
    console.error("Bir hata oluştu. İşte detayı:", hata);
}
    
}

altYaziyiCek();



