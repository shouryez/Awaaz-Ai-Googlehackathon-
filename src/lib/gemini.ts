import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface AnalysisResult {
  intent: {
    language: string;
    type: string;
    urgency: string;
    location: string;
    duration: string;
    impact: string;
  };
  routing: {
    department: string;
    officer: string;
    contact: string;
    email: string;
    sla: string;
  };
  drafts: {
    whatsapp: string;
    letter: string;
    email: string;
  };
  verification: {
    summary: string;
  };
}

export async function chatWithAI(message: string, history: { role: "user" | "model", parts: string }[]) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
    return "The Gemini API Key is missing. Please add a valid key to your .env file.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use 'gemini-flash-latest' which is confirmed working for this API key
  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.1-pro-preview"];
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "You are JanSevaAI, a professional Bangalore Caseworker. Your goal is to gather: 1. Problem Type, 2. Exact Landmark/Address (Always offer GPS sharing), 3. Duration, 4. Community Impact. Be conversational. Once ALL 4 are gathered, provide a technical summary and the token [READY_TO_FILE]." }]
          },
          {
            role: "model",
            parts: [{ text: "Understood. I will gather the required parameters professionally." }]
          },
          ...history.map(h => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.parts }]
          }))
        ]
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err: any) {
      console.warn(`Model ${modelName} failed:`, err.message);
      continue;
    }
  }

  return "I'm having trouble connecting to the AI service (Quota reached). Please try again in a moment or check your API key.";
}

export async function analyseGrievance(transcript: string, locationContext: string = "Bangalore"): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || "");
  
  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.1-pro-preview"];
  let lastError: any = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
        You are a Digital Government Case Officer.
        Transcript: "${transcript}"
        GPS Context: "${locationContext}"
        
        TASK: Extract Problem, Location, Duration, and Impact. Synthesize into formal English.
        OUTPUT: Valid JSON ONLY.
        {
          "intent": { "language": "string", "type": "string", "urgency": "string", "location": "string", "duration": "string", "impact": "string" },
          "routing": { "department": "string", "officer": "string", "contact": "string", "email": "string", "sla": "string" },
          "drafts": { "whatsapp": "string", "letter": "string", "email": "string" },
          "verification": { "summary": "string" }
        }
      `;

      const result = await model.generateContent(prompt);
      const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");
      return JSON.parse(jsonMatch[0]);
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  console.error("All models failed:", lastError);
  // Fail-safe manual extraction
  return {
    intent: { language: "English", type: "Civic Issue", urgency: "HIGH", location: locationContext, duration: "Active", impact: "Public Hardship" },
    routing: { department: "BBMP", officer: "Executive Engineer", contact: "1533", email: "commr@bbmp.gov.in", sla: "48 Hours" },
    drafts: { 
      whatsapp: "Urgent issue reported.", 
      letter: "To,\nThe Commissioner,\nBBMP.\n\nSubject: Formal Complaint.\n\nSir, I am reporting an issue. Please take action.", 
      email: "Subject: Grievance Report" 
    },
    verification: { summary: "Analysis used fail-safe mode." }
  };
}

