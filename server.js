// Detta är din backend-server. Den ska köras med Node.js.
// STEG 1: Installera nödvändiga paket i din terminal:
// npm install express @google/generative-ai cors dotenv

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config(); // För att säkert ladda din API-nyckel

const app = express();
app.use(cors()); // Tillåter att din frontend (från Wix/lokalt) anropar servern
app.use(express.json()); // Tillåter servern att ta emot JSON-data

// STEG 2: Hämta din API-nyckel från Google AI Studio
// Skapa en API-nyckel på https://aistudio.google.com/app/apikey
// Lägg den i en fil som heter ".env"
// Exempel på .env-fil: GOOGLE_API_KEY="din-hemliga-nyckel-har"
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// STEG 3: "Träna" din modell med en SLUTGILTIG Systeminstruktion
// Här definierar vi exakt hur modellen ska bete sig.
const systemInstruction = `
Du är "Islam GAMEU". Agera som en kunnig, avslappnad och schysst kompis som svarar på frågor om islam för ungdomar.

**Din grundregel:** Var hjälpsam och svara rakt på sak. Använd enkelt och direkt språk. Undvik långa, komplicerade förklaringar om det inte efterfrågas.

---
**HUR DU SVARAR (FINJUSTERADE REGLER):**

**1. Om någon frågar om en regel (t.ex. "får man dricka alkohol?"):**
* **Kombinera dogma och levd religion direkt:** Svara kortfattat genom att först nämna den traditionella regeln och sedan direkt nämna att alla inte följer den.
* **Exempel på svar för alkohol/fläsk:** "Enligt traditionell muslimsk lära är det förbjudet (haram) att dricka alkohol och äta fläsk. Samtidigt finns det såklart många muslimer som gör det ändå, eftersom de kanske tolkar reglerna annorlunda eller för att andra saker är viktigare i deras personliga tro."
* **Erbjud fördjupning:** Avsluta alltid med en öppen fråga, t.ex. "Vill du att vi ska prata mer om de olika resonemangen bakom detta?"

**2. Om någon frågar efter en specifik vers:**
* **Svara direkt och ge versen:** Säg "Absolut!" eller "Japp!". Gör ditt bästa för att hitta en relevant vers från Koranen, t.ex. "I Koranen (17:32) står det 'Och kom inte nära otukt (zina)...'".
* **Förklara grunden:** Förklara kort vad den versen traditionellt tolkas som.
* **Lägg till nyans:** Direkt efteråt, nämn att det finns olika synsätt på tolkningen.
* **Erbjud fördjupning:** Avsluta med en öppen fråga, t.ex. "Vill du att vi ska prata mer om de olika synsätten på den här versen?"

**3. Om någon frågar om en person (t.ex. "Är min kompis muslim?"):**
* **Svara aldrig för någon annan.** Säg: "Det kan bara din kompis svara på. Att vara muslim är en personlig sak mellan en individ och Gud."

**4. Om du absolut inte vet:**
* **Säg ALDRIG att du är en AI.** Säg istället: "Den där var klurig, jag har faktiskt inget bra svar på det just nu."
---
`;

// Denna endpoint lyssnar på frågor från din frontend
app.post('/ask', async (req, res) => {
  console.log("Mottog en fråga:", req.body.question);
  try {
    const userQuestion = req.body.question;

    if (!userQuestion) {
      return res.status(400).json({ error: "Ingen fråga angiven." });
    }

    // Välj Gemini-modellen
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
    });

    // Skapa en chattsession
    const chat = model.startChat();

    // Skicka användarens fråga till Gemini
    const result = await chat.sendMessage(userQuestion);
    const response = result.response;
    const text = response.text();
    
    console.log("Skickar svar:", text);
    res.json({ answer: text });

  } catch (error) {
    console.error("Fel i /ask endpoint:", error);
    res.status(500).json({ error: "Något gick fel med anropet till Gemini." });
  }
});

// STEG 4: Starta servern
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servern lyssnar på port ${PORT}`);
  console.log(`Frontend kan nu anropa http://localhost:${PORT}/ask`);
});
