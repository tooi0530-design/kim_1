import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSchedule = async (goal: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return ["Please configure your API_KEY to use AI features."];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a realistic daily schedule checklist (max 8 items) to achieve this goal: "${goal}". Keep items concise (under 10 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateQuote = async (): Promise<string> => {
    if (!apiKey) return "";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give me a very short, encouraging quote (max 15 words) in Korean for a daily planner.",
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}
