
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse, Bookmark } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeBookmark = async (url: string, title?: string): Promise<AIAnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this URL: ${url}${title ? ` (Title: ${title})` : ''}. 
      Return metadata as JSON:
      1. title: Professional title
      2. description: 1-sentence hook
      3. category: [Work, Learning, Technology, Personal, Entertainment]
      4. tags: 3 relevant keywords
      5. color: Brand hex code
      6. readingTime: Estimated time (e.g. "5 min")
      7. keyTakeaway: A 10-word summary of the value.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            color: { type: Type.STRING },
            readingTime: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING }
          },
          required: ["title", "description", "category", "tags", "color", "readingTime", "keyTakeaway"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as AIAnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      title: title || url,
      description: "No description available.",
      category: "Personal",
      tags: ["general"],
      color: "blue",
      readingTime: "2 min",
      keyTakeaway: "A useful web resource."
    };
  }
};

export const chatWithBookmarks = async (query: string, bookmarks: Bookmark[]): Promise<string> => {
  const context = bookmarks.map(b => `- ${b.title}: ${b.description} (Category: ${b.category})`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an AI librarian. Based on these bookmarks:
      ${context}
      
      User Question: ${query}
      
      Answer concisely using ONLY the provided bookmarks. If you can't find the answer, suggest something similar or say you don't have that info yet.`,
    });
    return response.text || "I couldn't find a clear answer in your bookmarks.";
  } catch (error) {
    return "The library is currently offline. Please try again later.";
  }
};

export const generateDetailedSummary = async (url: string, title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a detailed 2-3 sentence executive summary of this website: ${url} (Title: ${title}). Explain what it is and why a user might find it valuable.`,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    return "Error generating AI summary.";
  }
};
