import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function tailorResume(
  resume: string,
  jobDescription: string
): Promise<string> {
  try {
    const prompt = `
You are an expert AI resume tailoring assistant.

TASK:
Tailor the following resume according to the provided job description.

RULES:
- Keep it professional
- Improve ATS optimization
- Keep formatting clean
- Add relevant keywords naturally
- Do NOT invent fake experience
- Return ONLY the tailored resume

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to tailor resume");
  }
}

export async function refineResume(
  currentResume: string,
  instruction: string
): Promise<string> {
  try {
    const prompt = `
You are an expert resume editor.

CURRENT RESUME:
${currentResume}

USER INSTRUCTION:
${instruction}

Return ONLY the updated resume.
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to refine resume");
  }
}