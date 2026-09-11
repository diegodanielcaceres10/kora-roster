import { getCurrentApiLang, type ApiLang } from "../../i18n/apiLang";
import { httpClient } from "../../lib/http/httpClient";
import type { LegalDocument, LegalDocumentType } from "./terms.types";

export function getLegalDocument(document: LegalDocumentType, lang: ApiLang = getCurrentApiLang()) {
  return httpClient.get<LegalDocument>(`/legal/${document}?lang=${encodeURIComponent(lang)}`);
}

export function getTerms(lang?: ApiLang) {
  return getLegalDocument("terms", lang);
}
