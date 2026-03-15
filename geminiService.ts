import { GoogleGenAI, Type } from "@google/genai";
import { FurnitureItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function identifyFurniture(imageUri: string): Promise<FurnitureItem[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const mimeType = imageUri.split(';')[0].split(':')[1] || 'image/png';
  const base64Data = imageUri.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this interior design image and identify the main furniture pieces and decor items. For each item, provide its name (be specific but concise, e.g., 'Mid-century Modern Velvet Sofa'), category, a brief description, and a Google Shopping search URL. Return the data as a JSON array of objects.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              searchUrl: { type: Type.STRING },
            },
            required: ["name", "category", "description", "searchUrl"],
          },
        },
      },
    });

    const items = JSON.parse(response.text || "[]");
    return items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substring(7),
    }));
  } catch (error) {
    console.error("Error identifying furniture:", error);
    return [];
  }
}

export async function generateStyledRoom(imageUri: string, styleName: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const mimeType = imageUri.split(';')[0].split(':')[1] || 'image/png';
  const base64Data = imageUri.split(',')[1];

  console.log(`Generating ${styleName} room with mimeType: ${mimeType}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Redesign this room in a ${styleName} interior design style. Keep the basic layout and structure of the room but change the furniture, colors, textures, and decor to match the ${styleName} aesthetic. The result should be a high-quality, realistic interior design photo.`,
          },
        ],
      },
    });
    
    console.log("Gemini response received", response);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The AI did not return an image. It might have returned text instead: " + response.text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
}
