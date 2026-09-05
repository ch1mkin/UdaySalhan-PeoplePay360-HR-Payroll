export function formatMoney(
  amount: number | null | undefined,
  currency = "INR",
): string {
  if (amount == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number | null | undefined): string {
  if (amount == null || amount === 0) {
    return "—";
  }

  return `₹${(amount / 100000).toFixed(1)}L`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
