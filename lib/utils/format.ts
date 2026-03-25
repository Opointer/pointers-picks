export function formatRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function formatRange([low, high]: [number, number]): string {
  return `${low} - ${high}`;
}

export function formatSignedNumber(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}
