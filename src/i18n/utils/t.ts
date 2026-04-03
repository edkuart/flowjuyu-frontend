import esDictionary, { type Dictionary } from "../dictionaries/es";

type NestedKeyOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = NestedKeyOf<Dictionary>;

function resolveValue(
  dictionary: Dictionary,
  key: TranslationKey,
): string | undefined {
  const parts = key.split(".");
  let current: unknown = dictionary;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function t(
  dictionary: Dictionary,
  key: TranslationKey,
  fallbackDictionary: Dictionary = esDictionary,
): string {
  return (
    resolveValue(dictionary, key) ??
    resolveValue(fallbackDictionary, key) ??
    key
  );
}

export function createT(
  dictionary: Dictionary,
  fallbackDictionary: Dictionary = esDictionary,
) {
  return (key: TranslationKey) => t(dictionary, key, fallbackDictionary);
}
