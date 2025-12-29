// src/i18n/index.ts

import { LanguageCode } from "./settings";

// 📦 Importar TODOS los idiomas soportados
import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import ru from "./locales/ru.json";

// 🌍 Diccionario global de traducciones
export const translations: Record<LanguageCode, Record<string, any>> = {
  es,
  en,
  pt,
  fr,
  de,
  ru,
};

// 🧠 Obtener el diccionario del idioma actual
export const getTranslations = (locale: LanguageCode) => {
  return translations[locale] ?? translations.es;
};

// 🔎 Obtener texto anidado con soporte de variables {{var}}
export const getNestedTranslation = (
  obj: Record<string, any>,
  path: string,
  variables?: Record<string, string | number>
): string => {
  const keys = path.split(".");
  let result: any = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      // fallback seguro
      console.warn(`[i18n] Missing translation: ${path}`);
      return path;
    }
  }

  if (typeof result !== "string") {
    return path;
  }

  if (variables) {
    return result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key]?.toString() ?? `{{${key}}}`;
    });
  }

  return result;
};
