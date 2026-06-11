import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Upload server lama sudah dimatikan. Upload sekarang langsung dari halaman admin tanpa convert.",
    },
    { status: 410 }
  );
}
