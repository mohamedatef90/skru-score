import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getChatResponse(messages: ChatMessage[]) {
  const model = "gemini-3.1-pro-preview";
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const lastMessage = messages[messages.length - 1].text;

  const response = await ai.models.generateContent({
    model,
    contents: [...history, { role: 'user', parts: [{ text: lastMessage }] }],
    config: {
      systemInstruction: "You are an expert at the card game 'Skru'. Help the user with rules, strategy, and scoring. Use thinking mode for complex queries.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
