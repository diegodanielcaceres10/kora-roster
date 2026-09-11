import { useEffect, useState } from "react";
import { toApiLang, type ApiLang } from "../../../i18n/apiLang";
import { useIntl } from "react-intl";
import { getTerms } from "../terms.api";
import type { TermsResponse } from "../terms.types";

export function useCurrentTerms() {
  const { locale } = useIntl();
  const lang = toApiLang(locale as Parameters<typeof toApiLang>[0]);
  const [terms, setTerms] = useState<TermsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    setTerms(null);

    getTerms(lang as ApiLang)
      .then((currentTerms) => {
        if (!cancelled) setTerms(currentTerms);
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
  }, [lang]);

  return { terms, isLoading, hasError };
}
