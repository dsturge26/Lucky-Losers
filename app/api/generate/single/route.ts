import { NextRequest, NextResponse } from "next/server";
import { buildPrompt, getHairstyles, type Length } from "@/lib/hairstyles";
import { editHairstyle } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const length = String(form.get("length") ?? "") as Length;
  const styleId = String(form.get("styleId") ?? "");
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

  const style = getHairstyles(length).find((s) => s.id === styleId);
  if (!style) {
    return NextResponse.json({ error: "Unknown styleId for this length." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const out = await editHairstyle({
      imageBase64: buffer.toString("base64"),
      mimeType: file.type,
      prompt: buildPrompt(style),
    });
    return NextResponse.json({
      id: style.id,
      name: style.name,
      status: "ok",
      imageBase64: out.imageBase64,
      mimeType: out.mimeType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ id: style.id, name: style.name, status: "error", error: message }, { status: 500 });
  }
}
