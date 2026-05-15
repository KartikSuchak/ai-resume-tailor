import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
// Securely accessing the API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Throw an error if the API key is not configured, to fail fast and loudly
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Tailors a resume specifically for a given job description using Gemini AI.
 *
 * @param resumeText - The user's original resume text.
 * @param jobDescription - The job description to tailor the resume against.
 * @returns A promise that resolves to the tailored resume text.
 */
export const tailorResume = async (
  resumeText: string,
  jobDescription: string
): Promise<string> => {
  try {
    // Select the model. gemini-2.5-flash is excellent for fast text tasks.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The prompt engineering logic:
    // 1. Assign a persona (Expert ATS Resume Writer)
    // 2. Set strict boundaries (Do not make up facts)
    // 3. Provide formatting instructions (Clean Markdown)
    const prompt = `
You are an Expert ATS (Applicant Tracking System) Resume Writer and Career Coach.
Your task is to tailor the provided "Original Resume" to perfectly match the provided "Job Description".

### Strict Rules:
1. DO NOT invent or fabricate any experiences, skills, or metrics. Only use factual information present in the Original Resume.
2. Optimize keywords naturally so the resume passes ATS scans for the specific Job Description.
3. Rewrite bullet points to be highly professional, impactful, and concise, focusing on achievements rather than duties.
4. Organize the output cleanly using Markdown formatting (e.g., ## sections, bullet points).
5. Output ONLY the tailored resume text. Do not include introductory conversational text like "Here is the tailored resume...".

### Job Description:
${jobDescription}

### Original Resume:
${resumeText}
    `;

    // Execute the API call
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating tailored resume:", error);
    throw new Error(
      "Failed to communicate with Gemini AI. Please try again later."
    );
  }
};

/**
 * Refines a previously generated resume based on user instructions.
 *
 * @param currentResume - The currently displayed/tailored resume text.
 * @param userInstruction - The user's request for refinement.
 * @param originalJobDescription - The job description context.
 * @returns A promise that resolves to the refined resume text.
 */
export const refineResume = async (
  currentResume: string,
  userInstruction: string,
  originalJobDescription: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an Expert ATS Resume Writer and Career Coach. 
The user has a tailored resume and wants to make a specific refinement.

### Strict Rules:
1. ONLY apply the changes requested in the "User Instruction". Do not rewrite sections that were not asked to be changed.
2. DO NOT invent or fabricate any experiences, skills, or metrics. Preserve factual accuracy.
3. Keep the output formatted purely in clean Markdown.
4. Ensure the changes maintain high ATS optimization and a professional tone suitable for the original job description.
5. Output ONLY the complete refined resume text. Do not include any conversational filler (e.g., "Here is the refined resume").

### Job Description Context:
${originalJobDescription}

### User Instruction:
${userInstruction}

### Current Resume:
${currentResume}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error refining resume:", error);
    throw new Error(
      "Failed to communicate with Gemini AI. Please try again later."
    );
  }
};
