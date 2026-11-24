/** Serialize editable values without generated line identity. Never persist this snapshot. */
export function formSnapshot(value: unknown): string {
  return JSON.stringify(value, (key, entry: unknown) => (key === "key" ? undefined : entry));
}
