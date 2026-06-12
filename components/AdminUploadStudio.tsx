"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type UploadedVideo = {
  id: string;
  title: string;
  url: string;
  mediaDataUrl: string;
  videoUrl: string;
  fileUrl: string;
  filename: string;
  name: string;
  size: number;
  type: string;
  order: number;
};

type ContentItem = {
  id: string;
  title: string;
  description?: string;
  thumbnailDataUrl?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  mediaDataUrl?: string;
  mediaUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  mediaName?: string;
  filename?: string;
  videos?: UploadedVideo[];
  content_videos?: UploadedVideo[];
  isVip?: boolean;
  vip?: boolean;
  keyVip?: string;
  vipKey?: string;
  expiredAt?: string;
  expiresAt?: string;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  createdAt?: string;
  views?: number;
  likes?: number;
  unlikes?: number;
  ratings?: any[];
  comments?: any[];
};

const MAX_VIDEO_COUNT = 30;
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca thumbnail."));
    reader.readAsDataURL(file);
  });
}

function safeBlobName(name: string) {
  const clean = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || `video-${Date.now()}.mp4`;
}

function getContents(): ContentItem[] {
  try {
    return JSON.parse(localStorage.getItem("jasky_contents") || "[]");
  } catch {
    return [];
  }
}

function saveContents(contents: ContentItem[]) {
  localStorage.setItem("jasky_contents", JSON.stringify(contents));
  window.dispatchEvent(new Event("jasky-sync"));
}

function hasVideo(item: ContentItem) {
  return Boolean(
    item.videoUrl ||
      item.mediaDataUrl ||
      item.mediaUrl ||
      item.fileUrl ||
      (item.videos && item.videos.length > 0) ||
      (item.content_videos && item.content_videos.length > 0)
  );
}

export default function AdminUploadStudio() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vipKey, setVipKey] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [expiredAt, setExpiredAt] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  function load() {
    setContents(getContents());
  }

  useEffect(() => {
    load();

    const sync = () => load();
    window.addEventListener("storage", sync);
    window.addEventListener("jasky-sync", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jasky-sync", sync);
    };
  }, []);

  function pickVideos(files: FileList | null) {
    const selected = Array.from(files || []).filter((file) => {
      return file.type.startsWith("video/") || file.name.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/);
    });

    if (selected.length > MAX_VIDEO_COUNT) {
      alert("Maksimal 30 video sekali upload. Yang dipakai hanya 30 pertama.");
    }

    const clean = selected.slice(0, MAX_VIDEO_COUNT);
    const tooBig = clean.find((file) => file.size > MAX_VIDEO_SIZE);

    if (tooBig) {
      alert(`${tooBig.name} lebih dari 2GB.`);
      return;
    }

    setVideoFiles(clean);
  }

  async function uploadContent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Judul konten wajib diisi.");
      return;
    }

    if (videoFiles.length < 1) {
      alert("Pilih minimal 1 video.");
      return;
    }

    setLoading(true);
    setInfo(`Menyiapkan upload ${videoFiles.length} video...`);

    try {
      let thumbnailUrl = "";

      if (thumbnailFile) {
        setInfo("Membaca thumbnail...");
        thumbnailUrl = await readFileAsDataUrl(thumbnailFile);
      }

      const uploadedVideos: UploadedVideo[] = [];

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        setInfo(`Mengupload video ${i + 1}/${videoFiles.length}: ${file.name}`);

        const videoBlob = await upload(
          `videos/${Date.now()}-${i + 1}-${safeBlobName(file.name)}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            multipart: true,
          }
        );

        uploadedVideos.push({
          id: makeId("video"),
          title: file.name,
          url: videoBlob.url,
          mediaDataUrl: videoBlob.url,
          videoUrl: videoBlob.url,
          fileUrl: videoBlob.url,
          filename: file.name,
          name: file.name,
          size: file.size,
          type: file.type || "video/mp4",
          order: i + 1,
        });
      }

      const firstVideo = uploadedVideos[0];

      const item: ContentItem = {
        id: makeId("content"),
        title: title.trim(),
        description: description.trim(),
        isVip,
        vip: isVip,
        vipKey: vipKey.trim(),
        keyVip: vipKey.trim(),
        expiredAt,
        expiresAt: expiredAt,
        downloadEnabled,
        commentsEnabled,
        createdAt: new Date().toISOString(),
        thumbnailDataUrl: thumbnailUrl,
        thumbnailUrl,
        thumbnail_url: thumbnailUrl,
        mediaDataUrl: firstVideo?.videoUrl || "",
        mediaUrl: firstVideo?.videoUrl || "",
        videoUrl: firstVideo?.videoUrl || "",
        fileUrl: firstVideo?.videoUrl || "",
        mediaName: firstVideo?.filename || "",
        filename: firstVideo?.filename || "",
        videos: uploadedVideos,
        content_videos: uploadedVideos,
        views: 0,
        likes: 0,
        unlikes: 0,
        ratings: [],
        comments: [],
      };

      const next = [item, ...getContents()];
      saveContents(next);
      setContents(next);

      setTitle("");
      setDescription("");
      setVipKey("");
      setIsVip(false);
      setExpiredAt("");
      setThumbnailFile(null);
      setVideoFiles([]);
      setInfo("");

      alert(`${uploadedVideos.length} video berhasil diupload.`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? "Upload gagal: " + error.message
          : "Upload gagal. Cek Vercel Blob."
      );
    } finally {
      setLoading(false);
    }
  }

  function deleteContent(id: string) {
    const ok = confirm("Hapus konten ini?");
    if (!ok) return;

    const next = getContents().filter((item) => item.id !== id);
    saveContents(next);
    setContents(next);
  }

  function deleteNoVideo() {
    const ok = confirm("Hapus semua konten yang tidak punya video?");
    if (!ok) return;

    const next = getContents().filter((item) => hasVideo(item));
    saveContents(next);
    setContents(next);
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex items-center justify-between gap-3">
          <Link
            href="/user"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white/80"
          >
            Lihat User
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-pink-400/25 bg-pink-500/10 px-5 py-3 font-bold text-pink-100"
          >
            Beranda
          </Link>
        </div>

        <section className="rounded-[34px] border border-pink-400/20 bg-black/65 p-6 shadow-[0_25px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <p className="tracking-[0.35em] text-pink-200/70">JAKSKY ADMIN</p>
          <h1 className="mt-3 text-5xl font-black text-pink-300">Upload Konten</h1>
          <p className="mt-3 text-lg leading-relaxed text-white/55">
            Upload ke Vercel Blob. Bisa pilih 1–30 video sekaligus, maksimal 2GB per video.
          </p>

          <form onSubmit={uploadContent} className="mt-8 space-y-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul konten"
              className="w-full rounded-2xl border border-pink-400/30 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-white/35"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi konten"
              rows={4}
              className="w-full rounded-2xl border border-pink-400/30 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-white/35"
            />

            <label className="block rounded-3xl border border-pink-400/20 bg-white/5 p-5">
              <p className="text-2xl font-black">🖼️ Thumbnail</p>
              <p className="mt-1 text-white/45">Pilih foto cover konten.</p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
              />

              {thumbnailFile && (
                <p className="mt-3 break-all text-sm font-bold text-pink-100">
                  {thumbnailFile.name}
                </p>
              )}
            </label>

            <label className="block rounded-3xl border border-blue-400/25 bg-white/5 p-5">
              <p className="text-2xl font-black">🎥 File Video</p>
              <p className="mt-1 text-white/45">
                Pilih 1–30 video. Di HP, tahan file untuk pilih banyak.
              </p>

              <input
                type="file"
                accept="video/*,.mp4,.mov,.webm,.mkv"
                multiple
                onChange={(e) => pickVideos(e.target.files)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 p-4"
              />

              <p className="mt-3 text-sm font-black text-blue-100">
                Terpilih: {videoFiles.length}/{MAX_VIDEO_COUNT} video
              </p>

              {videoFiles.length > 0 && (
                <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {videoFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                    >
                      <p className="break-all font-bold">
                        {index + 1}. {file.name}
                      </p>
                      <p className="text-xs text-white/45">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </label>

            <select
              value={isVip ? "vip" : "gratis"}
              onChange={(e) => setIsVip(e.target.value === "vip")}
              className="w-full rounded-2xl border border-pink-400/30 bg-black/35 px-5 py-4 text-white outline-none"
            >
              <option value="gratis">Gratis</option>
              <option value="vip">VIP</option>
            </select>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={vipKey}
                onChange={(e) => setVipKey(e.target.value)}
                placeholder="Key VIP opsional"
                className="w-full rounded-2xl border border-pink-400/30 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-white/35"
              />

              <input
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                type="date"
                className="w-full rounded-2xl border border-pink-400/30 bg-white/10 px-5 py-4 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDownloadEnabled((value) => !value)}
                className={
                  downloadEnabled
                    ? "rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 px-4 py-4 font-black text-white"
                    : "rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black"
                }
              >
                ↓ Download {downloadEnabled ? "Aktif" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setCommentsEnabled((value) => !value)}
                className={
                  commentsEnabled
                    ? "rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-4 font-black text-white"
                    : "rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black"
                }
              >
                💬 Komentar {commentsEnabled ? "Aktif" : "Off"}
              </button>
            </div>

            {info && (
              <div className="rounded-2xl border border-yellow-300/25 bg-yellow-500/10 px-4 py-4 text-sm font-bold text-yellow-100">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-5 text-lg font-black text-white shadow-[0_18px_45px_rgba(236,72,153,.35)] disabled:opacity-50"
            >
              {loading
                ? "Mengupload..."
                : `↑ Upload Konten ${videoFiles.length ? `(${videoFiles.length} video)` : ""}`}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-[34px] border border-pink-400/20 bg-black/65 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-4xl font-black">Konten Saya</h2>
              <p className="mt-2 text-white/55">Kelola video yang sudah diupload.</p>
            </div>

            <button
              type="button"
              onClick={deleteNoVideo}
              className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 font-black text-red-100"
            >
              🗑️ Hapus Tanpa Video
            </button>
          </div>

          {contents.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-pink-400/25 bg-white/5 p-10 text-center">
              <div className="text-6xl">🎬</div>
              <h3 className="mt-4 text-2xl font-black">Belum ada konten</h3>
              <p className="mt-2 text-white/50">Konten yang diupload akan muncul di sini.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {contents.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
                >
                  <div className="aspect-video bg-black/50">
                    {item.thumbnailDataUrl || item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailDataUrl || item.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">🎬</div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="break-all text-xl font-black">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/45">
                      {(item.videos || item.content_videos || []).length ||
                        (hasVideo(item) ? 1 : 0)}{" "}
                      video
                    </p>

                    <button
                      type="button"
                      onClick={() => deleteContent(item.id)}
                      className="mt-4 w-full rounded-2xl bg-red-500/20 px-4 py-3 font-black text-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
