"use client";

import Link from "next/link";
import { useState } from "react";
import { saveLocalVideo } from "../../../lib/localVideoStore";

type Content = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailDataUrl: string;
  videoBlobKey: string;
  mediaName: string;
  uploadedBy: string;
  createdAt: string;
  downloadEnabled: boolean;
  commentsEnabled: boolean;
  views: number;
  likes: number;
  unlikes: number;
  ratings: number[];
  comments: any[];
};

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Gratis");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload() {
    if (!title.trim()) {
      alert("Judul wajib diisi.");
      return;
    }

    if (!thumbnailFile) {
      alert("Thumbnail wajib dipilih.");
      return;
    }

    if (!videoFile) {
      alert("Video wajib dipilih.");
      return;
    }

    if (!videoFile.type.startsWith("video/")) {
      alert("File video tidak valid.");
      return;
    }

    setLoading(true);

    try {
      const id = Date.now().toString();
      const videoBlobKey = `jasky-video-${id}-${videoFile.name}`;

      await saveLocalVideo(videoBlobKey, videoFile);

      const thumbnailDataUrl = await fileToDataUrl(thumbnailFile);

      const staffSession = JSON.parse(
        localStorage.getItem("jasky_staff_session") || "null"
      );

      const oldContents: Content[] = JSON.parse(
        localStorage.getItem("jasky_contents") || "[]"
      );

      const newContent: Content = {
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnailDataUrl,
        videoBlobKey,
        mediaName: videoFile.name,
        uploadedBy: staffSession?.username || "Admin",
        createdAt: new Date().toISOString(),
        downloadEnabled,
        commentsEnabled,
        views: 0,
        likes: 0,
        unlikes: 0,
        ratings: [],
        comments: [],
      };

      localStorage.setItem(
        "jasky_contents",
        JSON.stringify([newContent, ...oldContents])
      );

      alert("Upload berhasil. Sekarang thumbnail akan membuka video.");
      window.location.href = "/user";
    } catch (error) {
      console.error(error);
      alert("Upload gagal. Coba pakai video lebih kecil dulu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-5">
      <section className="mx-auto max-w-2xl">
        <div className="jasky-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="jasky-title text-4xl font-black">
                Admin Upload
              </h1>
              <p className="mt-2 text-pink-100/70">
                Upload thumbnail dan video dalam satu konten.
              </p>
            </div>

            <Link href="/user" className="rounded-full bg-white/10 px-4 py-2 font-black">
              User
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl p-4"
              placeholder="Judul video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="min-h-28 w-full rounded-2xl p-4"
              placeholder="Deskripsi video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="w-full rounded-2xl p-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Gratis">Gratis</option>
              <option value="VIP">VIP</option>
            </select>

            <label className="block rounded-2xl border border-pink-400/30 bg-white/10 p-4">
              <p className="font-black">Thumbnail</p>
              <p className="mt-1 text-sm text-pink-100/60">
                Gambar yang tampil di card user.
              </p>
              <input
                className="mt-3 w-full"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
            </label>

            <label className="block rounded-2xl border border-pink-400/30 bg-white/10 p-4">
              <p className="font-black">Video</p>
              <p className="mt-1 text-sm text-pink-100/60">
                Video ini yang akan muncul saat thumbnail diklik.
              </p>
              <input
                className="mt-3 w-full"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-black">
              <input
                type="checkbox"
                checked={downloadEnabled}
                onChange={(e) => setDownloadEnabled(e.target.checked)}
              />
              Izinkan download
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-black">
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={(e) => setCommentsEnabled(e.target.checked)}
              />
              Izinkan komentar
            </label>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="jasky-button w-full py-4 disabled:opacity-50"
            >
              {loading ? "Menyimpan video..." : "Upload Sekarang"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
