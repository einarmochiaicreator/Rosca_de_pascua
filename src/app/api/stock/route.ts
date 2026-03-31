import { getStock } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const stock = getStock();
  return Response.json(stock);
}
