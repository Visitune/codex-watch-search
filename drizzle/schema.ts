import { pgTable, serial, varchar, integer, boolean, timestamp, text, index } from "drizzle-orm/pg-core";

// PRD §10.1
export const codexDocument = pgTable("codex_document", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 64 }).notNull().unique(),
  documentType: varchar("document_type", { length: 8 }).notNull(),
  title: text("title_original").notNull(),
  committee: varchar("committee", { length: 32 }),
  adoptedYear: integer("first_adoption_year"),
  lastModified: integer("current_modified_date"),
  officialPageUrl: text("official_page_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("idx_doc_reference").on(t.reference), index("idx_doc_type").on(t.documentType)]);

// PRD §10.2 — version par langue
export const codexDocumentVersion = pgTable("codex_document_version", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => codexDocument.id),
  language: varchar("language", { length: 5 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  sha256: varchar("sha256", { length: 64 }),
  fileSize: integer("file_size"),
  blobUrl: text("blob_url"),
  downloadedAt: timestamp("downloaded_at"),
  extractionStatus: varchar("extraction_status", { length: 32 }).default("PENDING"),
}, (t) => [index("idx_version_doc_lang").on(t.documentId, t.language)]);

// PRD §10.8
export const codexCollectionRun = pgTable("codex_collection_run", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
  source: varchar("source", { length: 32 }).default("codex"),
  status: varchar("status", { length: 16 }),
  documentsSeen: integer("documents_seen"),
  documentsNew: integer("documents_new"),
  documentsModified: integer("documents_modified"),
  documentsRemoved: integer("documents_removed"),
  errors: text("errors"),
});
