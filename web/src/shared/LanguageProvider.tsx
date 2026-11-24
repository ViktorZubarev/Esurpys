"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Language = "en" | "ru";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);
const LANGUAGE_STORAGE_KEY = "esurpys-language";
const LANGUAGE_CHANGE_EVENT = "esurpys-language-change";

function subscribeToLanguage(callback: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === LANGUAGE_STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getLanguageSnapshot(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === "ru" ? "ru" : "en";
}

function getServerLanguageSnapshot(): Language {
  return "en";
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    window.dispatchEvent(
      new CustomEvent(LANGUAGE_CHANGE_EVENT, {
        detail: nextLanguage,
      })
    );
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}