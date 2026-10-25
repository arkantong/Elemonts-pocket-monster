import english from "./en.json" with { type: "json" };

export type Language = "en" | "id";
export const LANGUAGE_KEY = "elemonts.language.v1";
let currentLanguage: Language = "en";
const cache = new Map<string, string>();
const messages: Record<string, string> = english;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Longest phrase first; Unicode boundaries protect monster names and identifiers.
const phrases = Object.keys(messages).sort((a, b) => b.length - a.length);
const pattern = new RegExp(
  phrases
    .map(
      (key) =>
        `${/^\p{L}/u.test(key) ? "(?<![\\p{L}\\p{N}])" : ""}${escape(key)}${/\p{L}$/u.test(key) ? "(?![\\p{L}\\p{N}])" : ""}`,
    )
    .join("|"),
  "gu",
);

export function setTranslationLanguage(language: Language) {
  currentLanguage = language;
  cache.clear();
}

// Display boundary only: game IDs, saved data and server messages stay canonical.
// Non-string JSX values pass through without changing React elements or numbers.
export function t<T>(value: T): T {
  if (currentLanguage === "id" || typeof value !== "string") return value;
  const cached = cache.get(value);
  if (cached !== undefined) return cached as T;
  const translated =
    messages[value] ?? value.replace(pattern, (part) => messages[part]);
  if (cache.size >= 2000) cache.clear();
  cache.set(value, translated);
  return translated as T;
}
export function formatLocale() {
  return currentLanguage === "en" ? "en-US" : "id-ID";
}
