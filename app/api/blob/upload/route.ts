import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        error:
          "SERVER_MISSING_BLOB_READ_WRITE_TOKEN: token belum kebaca di Vercel server.",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "image/heic",
            "image/heif",
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
            : "Upload Blob gagal tanpa detail error.",
      },
      { status: 400 }
    );
  }
}
