// Placeholder DB layer — Vercel Postgres + Drizzle
// Pour MVP sans DB, on lit data/catalog-snapshot.json directement.
// Quand DATABASE_URL est défini, décommenter la config Drizzle ci-dessous.
/*
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
export const db = drizzle(sql);
*/
export const db = null as unknown;

export type CodexDocumentRow = {
  reference: string;
  title: string;
  committee: string;
  lastModified: number | null;
  documentType: string;
  languages: string[];
};
