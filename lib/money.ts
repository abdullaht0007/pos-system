export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function parsePriceInput(input: string): number {
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[$,\s]/g, "")
  const parsed = Number.parseFloat(cleaned)

  if (isNaN(parsed) || parsed < 0) {
    throw new Error("Invalid price format")
  }

  // Convert to cents and round to avoid floating point issues
  return Math.round(parsed * 100)
}

export function formatCurrency(cents: number): string {
  return formatCents(cents)
}
