import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-image";

export interface EditHairstyleInput {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  prompt: string;
}

export interface EditHairstyleOutput {
  imageBase64: string;
  mimeType: string;
}

export async function editHairstyle(input: EditHairstyleInput): Promise<EditHairstyleOutput> {
  if (!input.apiKey) {
    throw new Error("Missing Gemini API key.");
  }
  const ai = new GoogleGenAI({ apiKey: input.apiKey });

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

export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { base64: btoa(binary), mimeType: file.type };
}
