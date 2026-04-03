import type { SupportedLanguage } from "../config";
import type { Dictionary } from "../dictionaries/es";

export async function getDictionary(lang: SupportedLanguage): Promise<Dictionary> {
  switch (lang) {
    case "kiche":
      return (await import("../dictionaries/kiche")).default;
    case "kaqchikel":
      return (await import("../dictionaries/kaqchikel")).default;
    case "qeqchi":
      return (await import("../dictionaries/qeqchi")).default;
    case "es":
    default:
      return (await import("../dictionaries/es")).default;
  }
}
