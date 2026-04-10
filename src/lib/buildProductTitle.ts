export type ProductTitleParts = {
  raw: string
  main: string
  descriptor: string
  short: string
}

const FALLBACK_TITLE = "Sin nombre"
const MAX_SHORT_LENGTH = 40
const TITLE_SEPARATOR = /\s+-\s+|:\s*|\|\s*/

function compactText(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizeTitle(value: string) {
  return compactText(value)
    .replace(/^(?:[-:|]\s*)+/, "")
    .replace(/(?:\s*[-:|])+$/, "")
    .replace(/(?:\s*(?:-|:|\|)\s*){2,}/g, " - ")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*\|\s*/g, " | ")
    .trim()
}

function buildShortTitle(value: string) {
  if (value.length <= MAX_SHORT_LENGTH) return value

  const maxTextLength = MAX_SHORT_LENGTH - 3
  const candidate = value.slice(0, maxTextLength + 1)
  const lastSpace = candidate.lastIndexOf(" ")

  if (lastSpace > 0) {
    return `${candidate.slice(0, lastSpace).trimEnd()}...`
  }

  return `${value.slice(0, maxTextLength).trimEnd()}...`
}

export function buildProductTitle(nombre: string): ProductTitleParts {
  const raw = normalizeTitle(nombre)

  if (!raw) {
    return {
      raw: FALLBACK_TITLE,
      main: FALLBACK_TITLE,
      descriptor: "",
      short: FALLBACK_TITLE,
    }
  }

  const separatorMatch = raw.match(TITLE_SEPARATOR)

  if (separatorMatch?.index !== undefined) {
    const main = compactText(raw.slice(0, separatorMatch.index))
    const descriptor = normalizeTitle(
      raw.slice(separatorMatch.index + separatorMatch[0].length)
    )

    return {
      raw,
      main: main || raw,
      descriptor,
      short: buildShortTitle(raw),
    }
  }

  const words = raw.split(" ")
  const mainWordCount = words.length > 5 ? 3 : 2
  const main = words.slice(0, mainWordCount).join(" ")
  const descriptor = words.slice(mainWordCount).join(" ")

  return {
    raw,
    main: main || raw,
    descriptor,
    short: buildShortTitle(raw),
  }
}
