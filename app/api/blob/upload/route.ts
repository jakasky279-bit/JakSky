import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "SERVER_MISSING_BLOB_READ_WRITE_TOKEN" },
      { status: 500 }
    );
  }

  process.env.BLOB_READ_WRITE_TOKEN = token;

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-matroska",
            "application/octet-stream",
          ],
          maximumSizeInBytes: MAX_SIZE,
          tokenPayload: JSON.stringify({ app: "jasky" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("JakSky Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("JAKSKY_BLOB_UPLOAD_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload Blob gagal tanpa detail.",
      },
      { status: 400 }
    );
  }
}
