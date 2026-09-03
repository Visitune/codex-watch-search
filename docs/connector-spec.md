# Connector Spec — Codex Watch & Search — Phase 0 Discovery

**Date:** 3 September 2026
**Source primaire:** https://codex.fao.org/codex-texts/find-a-codex-text
**Statut:** Validé par reverse engineering live

## 1. Endpoint catalogue

```
POST https://codex.fao.org/codex-texts/find-a-codex-text/LoadFilter/
Content-Type: application/json
Referer: https://codex.fao.org/codex-texts/find-a-codex-text
Origin: https://codex.fao.org
X-Requested-With: XMLHttpRequest

Body: {"searchModel":{"ItemsPerPage":0,"Popularity":null,"Region":"","CategoryIds":[]}}
```

- Nécessite un `GET` préalable sur la page (session + cookies Sitefinity), puis POST avec headers `Referer` + `Origin` + `X-Requested-With`.
- Sans ces headers → 302 vers `/404`.
- Réponse `200 application/json` avec `{ TotalCount: number, Standards: CodexRawDocument[] }`.

### Snapshot du 03/09/2026

- `TotalCount`: **401**
- `Standards.length`: **401**
- Répartition par `Type` (valeur `setTab` Angular) :

| Type | setTab | Signification PRD | Count |
|------|--------|-------------------|-------|
| 5 | `Standards` | CXS | 246 |
| 1 | `Guidelines` | CXG | 91 |
| 4 | `Codes of Practice` | CXC | 58 |
| 3 | `MRLs` | CXM | 1 (CXM 2) |
| 2 | `Miscellaneous` | CXA | 4 |
| null | — | anomalie CXG 96-2022 (Type null) | 1 |

> Anomalie: `CXG 96-2022` a `Type: null` malgré un Reference `CXG`. Ne pas filtrer par `Type` pour le type PRD, mais conserver `document_type` depuis `Reference` + validation catalogue. Règle PRD §10: catalogue = source de vérité.

### Exemple brut

```json
{
  "Reference": "CXS 98-1981",
  "Title": "Standard for Cooked Cured Chopped Meat",
  "Committee": "CCPMPP",
  "LastModified": 2022,
  "Type": 5,
  "SharePointId": 156,
  "AdoptedYear": 1981,
  "LastModifiedSharepoint": 2022,
  "SharePointIdDocument": { "en": 8687, "fr": 9104, ... },
  "Description": { "en": "CXS_098e.pdf", "fr": "CXS_098f.pdf", ... },
  "DriveItemId": { "en": "01S2BM34...", ... },
  "ExternalLink": { "en": "", ... }
}
```

Champs clés pour le modèle `codex_document` :

- `Reference` → `reference` (PK logique, ex: `CXS 1-1985`, `CXC 1-1969`, `CXS 362R-2025` régional)
- `Title` → `title_original` / `title_en`
- `Committee` → `committee` (34 comités observés: CCPMPP, CCFH, CCFA, etc.)
- `LastModified` → `current_modified_date` (int année, ex: 2022) — **pas un timestamp**
- `LastModifiedSharepoint` → parfois 1999 vs 2022 → peu fiable, SHA-256 fait foi (PRD R3)
- `Type` → `document_type` normalisé (mapper 5→S, 1→G, 4→C, 3→M, 2→A, null→déduire du préfixe)
- `AdoptedYear` → `first_adoption_year`
- `SharePointId` → `official_page_id` (nécessaire pour construire URL PDF)
- `Description.{lang}` → nom fichier PDF par langue
- `DriveItemId`, `SharePointIdDocument` → ids SharePoint/MS Graph (non nécessaires MVP)

## 2. URLs PDF

Pattern observé dans le HTML Angular :

```
/restapi/searchstandard/{{documentFileName(standard.Description['en'])}}?lang=en&id={{standard.SharePointId}}
```

Testé live:

```
https://codex.fao.org/restapi/searchstandard/CXS_098e.pdf?lang=en&id=156 → 200 application/pdf 245KB (EN)
https://codex.fao.org/restapi/searchstandard/CXS_098f.pdf?lang=fr&id=156 → 200 application/pdf 442KB (FR)
```

- Si `Description[lang]` vide → traduction absente (ne pas considérer comme erreur 404, c'est normal PRD §12). Ex: `MRL2c.pdf` n'existe pas pour `zh`.
- `DriveItemId` vide n'empêche pas le download via `restapi/searchstandard`.
- Headers à réutiliser: `Referer` + `User-Agent` normal.

## 3. Langues

6 langues exposées par la page : `EN / FR / ES / AR / ZH / RU`.

Couverture sur 401 docs (Description non vide):

- EN 398/401, FR 351/401, ES 367/401, ZH 257, RU 255, AR 233.

MVP priorise **EN + FR** (351 docs ont FR). Versionnement par `language` dans `codex_document_version` (PRD §10.2).

## 4. Pagination / Filtrage

- Le POST avec `ItemsPerPage:0` retourne **tout** le catalogue en 1 appel (<2s, ~600KB JSON). Pas besoin de paginer pour le snapshot.
- Filtrage côté client dans Angular (`activeTab` 100/5/1/4/3/2 + `Title` search). Le backend ignore `CategoryIds` si vide.
- Tri côté client par `Reference/Title/Committee/LastModified` (natural sort `Intl.Collator`).

## 5. Modèle normalisé `CodexDocumentMetadata` (PRD §24)

```typescript
interface CodexDocumentMetadata {
  reference: string;        // "CXS 1-1985"
  title: string;
  committee: string;        // "CCFH"
  lastModified: number | null; // année
  type: 5|1|4|3|2|null;
  documentType: "CXS"|"CXG"|"CXC"|"CXM"|"CXA"|"UNKNOWN";
  sharePointId: number;
  adoptedYear: number | null;
  descriptions: Record<string,string>; // lang -> filename
  externalLink: Record<string,string>;
  officialPageUrl: string; // https://codex.fao.org/codex-texts/find-a-codex-text (catalogue)
  languagesAvailable: ("en"|"fr"|"es"|"zh"|"ru"|"ar")[];
}
```

Le reste du pipeline ne doit jamais parser le HTML, uniquement ce modèle.

## 6. Robustesse & risques

- **R1 API changeante:** isoler `lib/codex-connector.ts` (seul fichier connaissant `LoadFilter/`). Tests `scripts/poc_fetch*.` quotidiens via GitHub Action.
- **R3 LastModified peu fiable:** certains docs ont `LastModified: null` (CXM 2) ou `LastModifiedSharepoint` désynchronisé. Détection modif = SHA-256 après download (PRD §14 Niveau 2).
- **R2 URL PDF instable:** conserver `sharePointId + Description[lang]` dès collecte + hash.

## 7. Prochaines étapes

1. Snapshot quotidien via `POST LoadFilter/` → comparer `Reference` + `LastModified` → `codex_collection_run`.
2. Downloader PDF EN/FR via `GET /restapi/searchstandard/{file}?lang={lang}&id={sharePointId}` → calcul SHA-256 → stockage Vercel Blob.
3. Fallback `DirectDocumentConnector` si `restapi` échoue (re-tenter avec `DriveItemId` Graph API futur).
