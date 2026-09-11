import type { ApiLang } from "../../i18n/apiLang";

export interface TermsSection {
  title: string;
  body: string;
}

export interface TermsResponse {
  product: "roster";
  version: string;
  lang: ApiLang;
  updatedAt: string;
  intro: string;
  sections: TermsSection[];
}
