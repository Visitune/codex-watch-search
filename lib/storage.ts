import { put } from "@vercel/blob";

export type StoreResult = { url: string; sha256: string; size: number };

export async function storePdf(buffer: Buffer, key: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const blob = await put(key, buffer, { access: "public", contentType: "application/pdf" });
    return blob.url;
  } catch {
    return null;
  }
}

export function blobKey(reference: string, lang: string, sha256: string): string {
  const safe = reference.replace(/[^A-Za-z0-9]/g, "_");
  return `codex/${safe}/${lang}/${sha256.slice(0, 8)}.pdf`;
}
