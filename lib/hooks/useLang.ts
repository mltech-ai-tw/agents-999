"use client";

import { useCallback, useEffect, useState } from "react";
import { LANG_STORAGE_KEY, type Lang } from "../i18n";

/**
 * Reads/writes the UI language from localStorage and keeps it in sync across
 * tabs. Defaults to Chinese. Starts as "zh" on the server to avoid hydration
 * mismatch, then syncs to the stored value after mount.
 */
export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === "zh" || stored === "en") setLangState(stored);
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_STORAGE_KEY && (e.newValue === "zh" || e.newValue === "en")) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return [lang, setLang];
}
