export function personName(value: unknown): string {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") {
    return "—";
  }
  const record = row as { first_name?: string; last_name?: string; name?: string };
  if (record.name) {
    return record.name;
  }
  const name = [record.first_name, record.last_name].filter(Boolean).join(" ");
  return name || "—";
}
