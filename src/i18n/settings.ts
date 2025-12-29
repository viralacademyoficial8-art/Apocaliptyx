// src/i18n/settings.ts

export const languages = [
  { code: "es", name: "Español",    flag: "🇲🇽", nativeName: "Español" },
  { code: "en", name: "English",    flag: "🇺🇸", nativeName: "English" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", nativeName: "Português" },
  { code: "fr", name: "French",     flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German",     flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "ru", name: "Russian",    flag: "🇷🇺", nativeName: "Русский" }
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
export type Language = LanguageCode;

export const defaultLanguage: LanguageCode = "es";

// Lista rápida por si la necesitas en validaciones
export const supportedLanguageCodes = languages.map(l => l.code) as LanguageCode[];

// Type guard para evitar errores por strings raros (ej: "EN", "pt-BR", undefined)
export const isLanguageCode = (value: unknown): value is LanguageCode => {
  return typeof value === "string" && (supportedLanguageCodes as readonly string[]).includes(value);
};

export const getLanguageByCode = (code: unknown) => {
  if (isLanguageCode(code)) return languages.find((l) => l.code === code)!;
  return languages[0]; // es
};
