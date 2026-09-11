import { useEffect, useState } from "react";
import { toApiLang, type ApiLang } from "../../../i18n/apiLang";
import { useIntl } from "react-intl";
import { getLegalDocument } from "../terms.api";
import type { LegalDocument, LegalDocumentType } from "../terms.types";

export function useCurrentTerms(document: LegalDocumentType = "terms") {
  const { locale } = useIntl();
  const lang = toApiLang(locale as Parameters<typeof toApiLang>[0]);
  const [terms, setTerms] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    setTerms(null);

    getLegalDocument(document, lang as ApiLang)
      .then((currentDocument) => {
        if (!cancelled) setTerms(currentDocument);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [document, lang]);

  return { terms, isLoading, hasError };
}
