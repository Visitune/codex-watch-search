import crypto from "crypto";
import { buildPdfUrl, type CodexRawDocument } from "./codex-connector";
import { storePdf, blobKey } from "./storage";

export type DownloadResult = {
  reference: string;
  lang: "en" | "fr";
  sourceUrl: string;
  sha256: string;
  size: number;
  blobUrl: string | null;
  status: "OK" | "NOT_AVAILABLE" | "FAILED";
  error?: string;
};

export async function downloadOne(doc: CodexRawDocument, lang: "en" | "fr"): Promise<DownloadResult> {
  const url = buildPdfUrl(doc, lang);
  if (!url) return { reference: doc.Reference, lang, sourceUrl: "", sha256: "", size: 0, blobUrl: null, status: "NOT_AVAILABLE" };
  try {
    const res = await fetch(url, { headers: { "User-Agent": "CodexWatch/1.0", Referer: "https://codex.fao.org/codex-texts/find-a-codex-text" }, cache: "no-store" });
    if (!res.ok) return { reference: doc.Reference, lang, sourceUrl: url, sha256: "", size: 0, blobUrl: null, status: "FAILED", error: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const blobUrl = await storePdf(buf, blobKey(doc.Reference, lang, sha256));
    return { reference: doc.Reference, lang, sourceUrl: url, sha256, size: buf.length, blobUrl, status: "OK" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { reference: doc.Reference, lang, sourceUrl: url, sha256: "", size: 0, blobUrl: null, status: "FAILED", error: msg };
  }
}

export async function verifyHead(doc: CodexRawDocument, lang: "en" | "fr"): Promise<{ status: number; contentLength: string | null; contentType: string | null }> {
  const url = buildPdfUrl(doc, lang);
  if (!url) return { status: 0, contentLength: null, contentType: null };
  const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": "CodexWatch/1.0" } });
  return { status: res.status, contentLength: res.headers.get("content-length"), contentType: res.headers.get("content-type") };
}
