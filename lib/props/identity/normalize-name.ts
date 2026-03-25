const suffixPattern = /\b(jr|sr|ii|iii|iv|v)\b\.?/gi;

export function normalizePlayerName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’,-]/g, " ")
    .replace(suffixPattern, " ")
    .replace(/\bshai\b/gi, "shai")
    .replace(/\bsga\b/gi, "shai gilgeous alexander")
    .replace(/\bj\.\b/gi, "j")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
