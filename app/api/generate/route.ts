import { NextRequest, NextResponse } from "next/server";
import { buildPrompt, getHairstyles, type Length } from "@/lib/hairstyles";
import { editHairstyle } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

export interface GenerateResultItem {
  id: string;
  name: string;
  status: "ok" | "error";
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const length = String(form.get("length") ?? "") as Length;
  const file = form.get("image");

  if (!["short", "medium", "long"].includes(length)) {
    return NextResponse.json({ error: "length must be short, medium, or long." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image file is required." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 10 MB or smaller." }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = buffer.toString("base64");
  const mimeType = file.type;

  const styles = getHairstyles(length);

  const results = await Promise.all(
    styles.map<Promise<GenerateResultItem>>(async (style) => {
      try {
        const out = await editHairstyle({
          imageBase64,
          mimeType,
          prompt: buildPrompt(style),
        });
        return {
          id: style.id,
          name: style.name,
          status: "ok",
          imageBase64: out.imageBase64,
          mimeType: out.mimeType,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { id: style.id, name: style.name, status: "error", error: message };
      }
    }),
  );

  return NextResponse.json({ length, results });
}
