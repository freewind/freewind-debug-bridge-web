export function toOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => !!value))).map((value) => ({
    label: value,
    value,
  }))
}
