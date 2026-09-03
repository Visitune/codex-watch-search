import { NextResponse } from "next/server";
import { buildBulletin } from "@/lib/watch";
export async function GET() {
  return NextResponse.json(buildBulletin());
}
