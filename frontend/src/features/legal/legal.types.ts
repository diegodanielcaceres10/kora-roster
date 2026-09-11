import type { ApiLang } from "../../i18n/apiLang";

export type LegalDocumentType = "terms" | "privacy";

export interface LegalDocumentSection {
  title: string;
  body: string;
}

export interface LegalDocument {
  product: "roster";
  document: LegalDocumentType;
  version: string;
  lang: ApiLang;
  updatedAt: string;
  intro: string;
  sections: LegalDocumentSection[];
}