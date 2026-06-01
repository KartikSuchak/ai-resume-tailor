import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCuB9oBMp-sbWo9HVLOAZfwjLiTYpLrlVQ";
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const prompt = "Say hi";
    const modelName = "gemini-1.5-flash-latest";
    console.log(`Attempting content generation with model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    
    console.log(`Awaiting API response...`);
    const response = await result.response;
    const text = response.text();
    console.log("Success:", text);
  } catch (err: any) {
    console.error("Failed:", err.message || err);
    console.error("Full error:", err);
  }
}

test();
