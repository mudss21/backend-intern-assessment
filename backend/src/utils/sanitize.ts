import validator from "validator";

/** Trim, strip null bytes, enforce max length (safe for DB and JSON). */
export function cleanText(input: string, maxLength = 10_000): string {
  return input.trim().replace(/\0/g, "").slice(0, maxLength);
}

export function cleanOptionalText(
  input: string | undefined | null,
  maxLength = 10_000
): string | undefined {
  if (input == null || input === "") return undefined;
  return cleanText(input, maxLength);
}

export function normalizeEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const norm = validator.normalizeEmail(e);
  if (norm === false) return e;
  return norm;
}
