const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Read .env file manually
const envPath = path.join(__dirname, ".env");
let apiKey = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/VITE_GEMINI_API_KEY=["']?([^"'\r\n]+)/);
  if (match) {
    apiKey = match[1];
  }
}

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY not found in .env");
  process.exit(1);
}

console.log("Found API Key starting with:", apiKey.substring(0, 7));
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b"
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello! What is your name? Keep it under 5 words.");
      const response = await result.response;
      console.log(`  -> SUCCESS! Response: "${response.text().trim()}"`);
    } catch (err) {
      console.log(`  -> FAILED: ${err.message}`);
    }
  }
}

listModels();
