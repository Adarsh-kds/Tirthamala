import { getCards } from "@/lib/catalog";

export const dynamic = "force-static";

// One cached list for every Hub; pages server-render only their first cards.
export function GET() {
  return Response.json(getCards());
}
