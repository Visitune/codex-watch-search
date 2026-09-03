import crypto from "crypto";

export type ExtractionResult = {
  reference: string;
  lang: "en" | "fr";
  sourceUrl: string;
  sha256: string;
  size: number;
  textLength: number;
  pages: number | null;
  preview: string;
  status: "OK" | "NOT_AVAILABLE" | "FAILED";
  error?: string;
};

export async function extractOne(reference: string, sourceUrl: string, lang: "en" | "fr"): Promise<ExtractionResult> {
  if (!sourceUrl) return { reference, lang, sourceUrl: "", sha256: "", size: 0, textLength: 0, pages: null, preview: "", status: "NOT_AVAILABLE" };
  try {
    const res = await fetch(sourceUrl, { headers: { "User-Agent": "CodexWatch/1.0" }, cache: "no-store" });
    if (!res.ok) return { reference, lang, sourceUrl, sha256: "", size: 0, textLength: 0, pages: null, preview: "", status: "FAILED", error: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    await parser.destroy();
    const text = result.text ?? "";
    return {
      reference,
      lang,
      sourceUrl,
      sha256,
      size: buf.length,
      textLength: text.length,
      pages: result.pages?.length ?? result.total ?? null,
      preview: text.slice(0, 2000),
      status: "OK",
    };
  } catch (e: unknown) {
    return {
      reference,
      lang,
      sourceUrl,
      sha256: "",
      size: 0,
      textLength: 0,
      pages: null,
      preview: "",
      status: "FAILED",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
