import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-image";

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!cachedClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Copy .env.local.example to .env.local and add your key.");
    }
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export interface EditHairstyleInput {
  imageBase64: string;
  mimeType: string;
  prompt: string;
}

export interface EditHairstyleOutput {
  imageBase64: string;
  mimeType: string;
}

export async function editHairstyle(input: EditHairstyleInput): Promise<EditHairstyleOutput> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
          { text: input.prompt },
        ],
      },
    ],
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      return {
        imageBase64: inline.data,
        mimeType: inline.mimeType ?? "image/png",
      };
    }
  }

  const text = parts.map((p) => (p as { text?: string }).text).filter(Boolean).join(" ").trim();
  throw new Error(
    text
      ? `Model returned no image. Message: ${text}`
      : "Model returned no image data.",
  );
}
