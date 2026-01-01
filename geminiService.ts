
import { GoogleGenAI, Type } from "@google/genai";
import { TriviaSet } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TOPICS = [
  "US City Populations",
  "Olympic Gold Medal Counts",
  "Movie Box Office (Millions)",
  "Deepest Parts of the Ocean (Meters)",
  "Tallest Mountains (Feet)",
  "Life Expectancy of Animals (Years)",
  "Yearly Coffee Consumption (Cups per Capita)",
  "Internet Speeds by Country (Mbps)",
  "Calories in Popular Foods",
  "Wealth of Famous Billionaires (Billions USD)"
];

export const generateTriviaSet = async (selectedTopic?: string): Promise<TriviaSet> => {
  const topic = selectedTopic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a trivia set for the topic: "${topic}". 
    Create 5-7 items. For each item, provide:
    1. A well-known item (e.g., "Chicago").
    2. A "proposedValue" (a plausible but incorrect statistic).
    3. The "actualValue" (the true current statistic).
    4. The "unit" (e.g., "people", "USD", "meters").
    5. A short "fact" about this item's statistic.
    6. "context" (what the statistic represents, e.g. "Total Population").
    
    The proposed value should be within 10-40% of the actual value to make it challenging.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                proposedValue: { type: Type.NUMBER },
                actualValue: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                context: { type: Type.STRING },
                fact: { type: Type.STRING }
              },
              required: ["name", "proposedValue", "actualValue", "unit", "context", "fact"]
            }
          }
        },
        required: ["topic", "items"]
      }
    }
  });

  const data = JSON.parse(response.text);
  // Ensure IDs exist
  data.items = data.items.map((item: any, index: number) => ({
    ...item,
    id: item.id || `item-${index}`
  }));
  
  return data as TriviaSet;
};

export { TOPICS };
