import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

function isFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value
  );
}

function safeExt(name: string, fallback: string) {
  const ext = path.extname(name || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || fallback;
}

async function saveUploadFile(file: File, targetPath: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);
}

async function runFfmpeg(args: string[]) {
  await execFileAsync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], {
    maxBuffer: 1024 * 1024 * 20,
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const thumbnail = form.get("thumbnail");
    const video = form.get("video");

    if (!isFile(video)) {
      return NextResponse.json(
        { error: "Video wajib dipilih." },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const tmpDir = path.join(process.cwd(), ".tmp", "jasky");

    await mkdir(uploadDir, { recursive: true });
    await mkdir(tmpDir, { recursive: true });

    const inputVideoExt = safeExt(video.name, ".mov");
    const inputVideoPath = path.join(tmpDir, `${id}-input${inputVideoExt}`);
    const outputVideoName = `${id}-video.mp4`;
    const outputVideoPath = path.join(uploadDir, outputVideoName);

    await saveUploadFile(video, inputVideoPath);

    await runFfmpeg([
      "-y",
      "-i",
      inputVideoPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputVideoPath,
    ]);

    let thumbnailUrl = "";

    if (isFile(thumbnail)) {
      const thumbExt = safeExt(thumbnail.name, ".jpg");
      const thumbName = `${id}-thumb${thumbExt}`;
      const thumbPath = path.join(uploadDir, thumbName);

      await saveUploadFile(thumbnail, thumbPath);
      thumbnailUrl = `/uploads/${thumbName}`;
    } else {
      const thumbName = `${id}-thumb.jpg`;
      const thumbPath = path.join(uploadDir, thumbName);

      await runFfmpeg([
        "-y",
        "-ss",
        "00:00:01",
        "-i",
        outputVideoPath,
        "-frames:v",
        "1",
        "-q:v",
        "3",
        thumbPath,
      ]);

      thumbnailUrl = `/uploads/${thumbName}`;
    }

    await unlink(inputVideoPath).catch(() => {});

    return NextResponse.json({
      ok: true,
      thumbnailUrl,
      videoUrl: `/uploads/${outputVideoName}`,
      mediaName: video.name,
      mediaType: "video/mp4",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal convert video. Pastikan ffmpeg sudah terinstall dan file video tidak rusak.",
      },
      { status: 500 }
    );
  }
}
