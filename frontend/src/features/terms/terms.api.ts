import { getCurrentApiLang, type ApiLang } from "../../i18n/apiLang";
import { httpClient } from "../../lib/http/httpClient";
import type { TermsResponse } from "./terms.types";

export function getTerms(lang: ApiLang = getCurrentApiLang()) {
  return httpClient.get<TermsResponse>(`/terms?lang=${encodeURIComponent(lang)}`);
}
