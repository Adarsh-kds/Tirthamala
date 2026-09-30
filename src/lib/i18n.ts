import en from "@/messages/en.json";

export type MessageKey = keyof typeof en;

// English only for now; add a locale argument and catalogue lookup when Hindi lands.
export function t(key: MessageKey): string {
  return en[key];
}
