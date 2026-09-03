/**
 * CodexSource — connecteur isolé (PRD §24)
 * Seul fichier qui connaît l'implémentation Sitefinity LoadFilter.
 * Le reste du pipeline consomme CodexDocumentMetadata.
 */

export const CODEX_CATALOG_URL = "https://codex.fao.org/codex-texts/find-a-codex-text";
export const CODEX_LOADFILTER_URL = `${CODEX_CATALOG_URL}/LoadFilter/`;

export type CodexRawDocument = {
  Reference: string;
  Title: string;
  Committee: string;
  LastModified: number | null;
  Type: number | null;
  SharePointId: number;
  AdoptedYear: number | null;
  StandardYear: number | null;
  StandardRevisionYear: number | null;
  LastModifiedSharepoint: number | null;
  PublishedDate: string | null;
  Created: string;
  Popularity: boolean;
  SharePointIdDocument: Record<string, number | null>;
  DriveItemId: Record<string, string>;
  Description: Record<string, string>;
  ExternalLink: Record<string, string>;
  Url: string;
};

export type CodexLoadFilterResponse = {
  TotalCount: number;
  Standards: CodexRawDocument[];
};

export type DocumentType = "CXS" | "CXG" | "CXC" | "CXM" | "CXA" | "UNKNOWN";

export interface CodexDocumentMetadata {
  reference: string;
  title: string;
  committee: string;
  lastModified: number | null;
  typeRaw: number | null;
  documentType: DocumentType;
  sharePointId: number;
  adoptedYear: number | null;
  descriptions: Record<string, string>;
  languagesAvailable: string[];
  officialPageUrl: string;
}

const TYPE_MAP: Record<number, DocumentType> = {
  5: "CXS",
  1: "CXG",
  4: "CXC",
  3: "CXM",
  2: "CXA",
};

function inferDocumentType(reference: string, typeRaw: number | null): DocumentType {
  if (typeRaw !== null && TYPE_MAP[typeRaw]) return TYPE_MAP[typeRaw];
  const prefix = reference.split(" ")[0];
  if (["CXS", "CXG", "CXC", "CXM", "CXA"].includes(prefix)) return prefix as DocumentType;
  return "UNKNOWN";
}

export function normalize(raw: CodexRawDocument): CodexDocumentMetadata {
  const langs = Object.entries(raw.Description)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k]) => k)
    .filter((k) => ["en", "fr", "es", "zh", "ru", "ar"].includes(k));
  return {
    reference: raw.Reference.trim(),
    title: raw.Title.trim(),
    committee: raw.Committee?.trim() ?? "",
    lastModified: raw.LastModified,
    typeRaw: raw.Type,
    documentType: inferDocumentType(raw.Reference, raw.Type),
    sharePointId: raw.SharePointId,
    adoptedYear: raw.AdoptedYear,
    descriptions: raw.Description,
    languagesAvailable: langs,
    officialPageUrl: CODEX_CATALOG_URL,
  };
}

export function buildPdfUrl(raw: CodexRawDocument, lang: "en" | "fr"): string | null {
  const file = raw.Description[lang];
  if (!file || file.trim() === "") return null;
  return `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(file)}?lang=${lang}&id=${raw.SharePointId}`;
}

export function buildOfficialUrl(reference: string): string {
  // Le nouveau site n'expose pas de fiche HTML par référence (listing POST uniquement).
  // On renvoie vers le catalogue officiel avec ancre de recherche + fallback FAO legacy.
  // Le lien FAO legacy reste la page de référence la plus stable pour le grand public.
  return `https://codex.fao.org/codex-texts/find-a-codex-text`;
}

export function buildFaoLegacyUrl(reference: string): string {
  // Fallback legacy FAO — recherche par référence sur le site FAO
  return `https://www.fao.org/fao-who-codexalimentarius/codex-texts/list-standards/en/?provide=standards&orderField=reference&orderVal=asc&search=${encodeURIComponent(reference)}`;
}

export interface CodexSource {
  fetchCatalog(): Promise<CodexLoadFilterResponse>;
}

export class NewCodexWebConnector implements CodexSource {
  async fetchCatalog(): Promise<CodexLoadFilterResponse> {
    // 1) GET page to establish session/cookies (Sitefinity)
    await fetch(CODEX_CATALOG_URL, {
      headers: { "User-Agent": "CodexWatch/1.0" },
      cache: "no-store",
    });

    // 2) POST LoadFilter
    const res = await fetch(CODEX_LOADFILTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": CODEX_CATALOG_URL,
        "Origin": "https://codex.fao.org",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
        "User-Agent": "CodexWatch/1.0",
      },
      body: JSON.stringify({
        searchModel: { ItemsPerPage: 0, Popularity: null, Region: "", CategoryIds: [] },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`LoadFilter failed ${res.status} ${await res.text().then((t) => t.slice(0, 500))}`);
    }
    const data = (await res.json()) as CodexLoadFilterResponse;
    if (!Array.isArray(data.Standards)) throw new Error("Invalid catalog response: missing Standards");
    return data;
  }
}

// Fallback stub — PRD §24
export class LegacyCodexConnector implements CodexSource {
  async fetchCatalog(): Promise<CodexLoadFilterResponse> {
    throw new Error("LegacyCodexConnector not implemented — use NewCodexWebConnector");
  }
}
