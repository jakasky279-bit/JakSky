import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN || "";

  return NextResponse.json({
    hasToken: token.length > 0,
    tokenLength: token.length,
    tokenLooksRight:
      token.startsWith("vercel_blob_rw_") ||
      token.startsWith("vercel_blob_"),
  });
}
