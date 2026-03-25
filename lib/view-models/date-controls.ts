const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toCentralDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const parts = dateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function formatCentralDateLabel(value: string): string {
  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.valueOf())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

export function shiftDateKey(value: string, deltaDays: number): string {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return toCentralDateKey(date);
}

export function sanitizeDateKey(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
