import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toApiLang, type ApiLang } from "../../../i18n/apiLang";
import { getLegalDocument } from "../legal.api";
import type { LegalDocument, LegalDocumentType } from "../legal.types";

export function useCurrentLegalDocument(document: LegalDocumentType = "terms") {
  const { locale } = useIntl();
  const lang = toApiLang(locale as Parameters<typeof toApiLang>[0]);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    setLegalDocument(null);

    getLegalDocument(document, lang as ApiLang)
      .then((currentDocument) => {
        if (!cancelled) setLegalDocument(currentDocument);
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

  return { legalDocument, isLoading, hasError };
}