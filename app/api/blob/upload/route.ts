import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-matroska",
          ],
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          tokenPayload: JSON.stringify({ app: "jasky" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("JakSky upload selesai:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload Blob gagal. Cek BLOB_READ_WRITE_TOKEN.",
      },
      { status: 400 }
    );
  }
}
