import { GoogleGenerativeAI } from "@google/generative-ai";


const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log("🔍 Checking API Key...");
  if (!apiKey) {
    console.error("❌ No API Key found in .env!");
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.error) {
       throw new Error(result.error.message);
    }

    console.log("\n✅ ACCESSIBLE MODELS:");
    result.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- ${m.name.replace('models/', '')}`);
      }
    });
  } catch (error) {
    console.error("\n❌ API Error:", error.message);
  }
}

listModels();
