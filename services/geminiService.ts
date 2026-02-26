import { GoogleGenAI } from "@google/genai";
import { DashboardData } from "../types";

// Initialize Gemini client safely
// The API key is expected to be in process.env.API_KEY
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables. AI features may not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDataInsights = async (data: DashboardData): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key is missing. Please configure your environment to use Gemini insights.";
  }

  // Summarize data for the prompt to avoid token limits if data is huge
  // In a real app, we'd do more sophisticated sampling or aggregation
  const summary = {
    totalClicks: data.timeline.reduce((acc, curr) => acc + curr.clicks, 0),
    totalImpressions: data.timeline.reduce((acc, curr) => acc + curr.impressions, 0),
    topQueries: data.queries.slice(0, 5),
    topPages: data.pages.slice(0, 5),
    recentTrend: data.timeline.slice(-3) // Last 3 days
  };

  const prompt = `
    Analyze this search console performance data summary and act as a senior SEO strategist.
    
    Data Summary:
    ${JSON.stringify(summary, null, 2)}
    
    Provide 3 key actionable insights in a concise format. 
    Focus on opportunities to improve CTR or ranking for high-potential queries.
    Keep the tone professional and data-driven.
    Output plain text with bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};