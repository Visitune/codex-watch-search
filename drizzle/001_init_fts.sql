-- Migration 001 — Codex Watch Postgres (Vercel/Neon) + FTS + pgvector
-- Exécuter via: psql $DATABASE_URL -f drizzle/001_init_fts.sql  OU  drizzle-kit push

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- Si les tables n'existent pas encore (fallback drizzle-kit generate)
-- Le SQL ci-dessous est idempotent — drizzle-kit générera les CREATE TABLE, ce fichier ajoute les index FTS

-- Index FTS sur codex_document (title + reference) — 2 langues
-- On utilise une colonne générée si Postgres >=12, sinon index d'expression
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_index WHERE indexname = 'idx_doc_title_fr') THEN
    CREATE INDEX idx_doc_title_fr ON codex_document USING GIN (to_tsvector('french', coalesce(title_original,'')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_index WHERE indexname = 'idx_doc_title_en') THEN
    CREATE INDEX idx_doc_title_en ON codex_document USING GIN (to_tsvector('english', coalesce(title_original,'')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_index WHERE indexname = 'idx_doc_ref_trgm') THEN
    CREATE INDEX idx_doc_ref_trgm ON codex_document USING GIN (reference gin_trgm_ops);
  END IF;
END $$;

-- Pour les sections/chunks (future) — placeholder
-- CREATE TABLE codex_section ... avec tsv

SELECT 'FTS + pgvector ready' as status;
