# Codex Watch & Search

Surveillance & recherche plein texte sur les **textes officiels Codex Alimentarius** (Standards CXS, Guidelines CXG, Codes of Practice CXC, MRLs, Miscellaneous) — source primaire [codex.fao.org — Find a Codex text](https://codex.fao.org/codex-texts/find-a-codex-text).

> PRD: `Codex_Watch_Search_PRD.md` (v0.1, 03/09/2026) — Niveau A, textes officiels uniquement. Nouveau site lancé 28/08/2026.

## Stack (Option A — Full Vercel, simple)

- **Frontend:** Next.js 15 App Router + Tailwind + shadcn/ui
- **DB future:** Vercel Postgres (Neon) + Drizzle ORM — MVP lit `data/catalog-snapshot.json` directement
- **Stockage future:** Vercel Blob (PDF + SHA-256)
- **Collecte:** `POST /codex-texts/find-a-codex-text/LoadFilter/` → `GET /restapi/searchstandard/{file}?lang=en&id={SharePointId}`

## Phase 0 — Discovery (validé 03/09/2026)

Voir `docs/connector-spec.md`.

- Endpoint: `POST /LoadFilter/` avec headers `Referer`+`Origin`+`X-Requested-With`
- Snapshot: **401 docs** (246 CXS, 91 CXG, 58 CXC, 1 CXM, 4 CXA, 1 anomalie CXG 96-2022 Type null)
- Couverture EN 398/401, FR 351/401 (MVP EN/FR)
- PDF: `https://codex.fao.org/restapi/searchstandard/CXS_098e.pdf?lang=en&id=156` (200 OK)

## Démarrage local

```bash
npm install
npm run dev # http://localhost:3000
```

Pages:
- `/` — catalogue filtrable (q, type, committee) + liens PDF EN/FR + détail
- `/documents/[reference]` — ex: `/documents/CXC%201-1969`
- API: `GET /api/catalog`, `GET /api/search?q=&type=&committee=`, `GET /api/cron/collect`

Scripts:
```bash
npm run collector:discovery # fetch live catalog → data/catalog-snapshot.json
```

## Déploiement Vercel

1. Push sur GitHub → import sur Vercel
2. Env: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET` (voir `.env.example`)
3. `vercel.json` cron `0 6 * * *` → `/api/cron/collect` (snapshot quotidien)

DB future:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Roadmap PRD §37

- [x] Phase 0 Discovery — connector spec + snapshot
- [x] Phase 1 Catalogue — UI + API + vercel.json cron (MVP sans DB)
- [ ] Phase 2 Documents — downloader EN/FR + SHA-256 + Blob
- [ ] Phase 3 Veille — diff + bulletin hebdo
- [ ] Phase 4 Recherche FTS (Postgres tsvector)
- [ ] Phase 5 Sémantique — pgvector + Ask Codex avec citations

## Références

- [codex.fao.org](https://codex.fao.org/)
- [Find a Codex text](https://codex.fao.org/codex-texts/find-a-codex-text)
- [Codex databases](https://codex.fao.org/codex-texts/codex-online-databases)
