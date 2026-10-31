import en from "@/messages/en.json";

export type MessageKey = keyof typeof en;

// English only for now; add a locale argument and catalogue lookup when Hindi lands.
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const s: string = en[key];
  return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m)) : s;
}
