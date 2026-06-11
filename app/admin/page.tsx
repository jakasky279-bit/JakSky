"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Content = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailDataUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  videoBlobKey?: string;
  mediaName?: string;
  mediaType?: string;
  uploadedBy?: string;
  createdAt?: string;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  views?: number;
  likes?: number;
  unlikes?: number;
  ratings?: number[];
  comments?: any[];

  mediaDataUrl?: string;
  mediaUrl?: string;
  fileUrl?: string;
  filename?: string;
  thumbnail_url?: string;
  videos?: any[];
  content_videos?: any[];
};

export default function AdminPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Gratis");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  function toast(message: string, type: "success" | "error" | "info" = "info") {
    if (typeof window !== "undefined" && (window as any).jaskyToast) {
      (window as any).jaskyToast(message, type);
      return;
    }

    alert(message);
  }

  function readContents(): Content[] {
    try {
      return JSON.parse(localStorage.getItem("jasky_contents") || "[]");
    } catch {
      return [];
    }
  }

  function saveContents(next: Content[]) {
    setContents(next);
    localStorage.setItem("jasky_contents", JSON.stringify(next));
  }

  useEffect(() => {
    setContents(readContents());
  }, []);

  function handleThumbnail(file?: File | null) {
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleVideo(file?: File | null) {
    if (!file) return;

    setVideoFile(file);
  }

  async function uploadContent() {
    if (!title.trim()) {
      toast("Judul konten wajib diisi.", "error");
      return;
    }

    if (!videoFile) {
      toast("File video wajib dipilih.", "error");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("video", videoFile);

      if (thumbnailFile) {
        form.append("thumbnail", thumbnailFile);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        toast(data.error || "Upload gagal.", "error");
        return;
      }

      let staffSession: any = null;

      try {
        staffSession = JSON.parse(
          localStorage.getItem("jasky_staff_session") || "null"
        );
      } catch {}

      const newContent: Content = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnailUrl: data.thumbnailUrl,
        videoUrl: data.videoUrl,
        mediaName: data.mediaName || videoFile.name,
        mediaType: data.mediaType || "video/mp4",
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

      const next = [newContent, ...readContents()];
      saveContents(next);

      setTitle("");
      setDescription("");
      setCategory("Gratis");
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoFile(null);
      setDownloadEnabled(true);
      setCommentsEnabled(true);

      toast("Upload berhasil. Video sudah siap ditonton.", "success");
    } catch (error) {
      console.error(error);
      toast("Upload gagal. Coba video yang lebih kecil dulu.", "error");
    } finally {
      setLoading(false);
    }
  }

  function deleteContent(content: Content) {
    const ok = confirm(`Hapus konten "${content.title}"?`);

    if (!ok) return;

    const next = readContents().filter((item) => item.id !== content.id);
    saveContents(next);
    toast("Konten berhasil dihapus.", "success");
  }

  function deleteBrokenContents() {
    const ok = confirm("Hapus semua konten lama yang tidak punya video?");

    if (!ok) return;

    const all = readContents();

    const good = all.filter(
      (item) => item.videoUrl || item.mediaDataUrl || item.videoBlobKey
    );

    saveContents(good);
    toast(`${all.length - good.length} konten tanpa video dihapus.`, "success");
  }

  function thumb(item: Content) {
    return item.thumbnailUrl || item.thumbnailDataUrl || "";
  }

  return (
    <main className="min-h-screen p-4 pb-24">
      <section className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[34px] border border-pink-400/35 bg-black/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] border border-pink-400/35 bg-gradient-to-br from-pink-500/20 to-blue-600/20 text-6xl shadow-[0_0_45px_rgba(255,77,184,0.18)] sm:flex">
              ☁️
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="jasky-title text-4xl font-black md:text-5xl">
                    Admin Upload
                  </h1>

                  <p className="mt-2 leading-7 text-pink-100/65">
                    Upload thumbnail dan video dari galeri. MOV/MP4 akan
                    diproses otomatis agar siap diputar.
                  </p>
                </div>

                <Link
                  href="/user"
                  className="rounded-2xl border border-pink-400/25 bg-white/10 px-4 py-3 text-sm font-black text-white"
                >
                  User
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                📝
              </span>

              <input
                className="w-full rounded-[22px] border border-pink-400/35 bg-white/5 px-12 py-4 font-bold text-white outline-none placeholder:text-pink-100/35 focus:border-pink-300"
                placeholder="Judul konten"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-5 text-xl">✍️</span>

              <textarea
                className="min-h-32 w-full rounded-[22px] border border-pink-400/35 bg-white/5 px-12 py-4 font-bold text-white outline-none placeholder:text-pink-100/35 focus:border-pink-300"
                placeholder="Deskripsi"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="rounded-[28px] border border-pink-400/40 bg-gradient-to-br from-pink-500/10 via-white/5 to-blue-600/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-500/15 text-3xl">
                  🖼️
                </div>

                <div>
                  <h2 className="text-xl font-black">Thumbnail</h2>
                  <p className="mt-1 text-sm leading-6 text-pink-100/60">
                    Pilih gambar yang akan tampil di card user.
                  </p>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-[22px] border border-pink-400/25 bg-black/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                    🖼️
                  </div>

                  <div>
                    <p className="font-black text-white">Pilih File</p>
                    <p className="text-sm text-pink-100/55">
                      JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                <span className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-3 text-sm font-black text-white">
                  Galeri
                </span>

                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(event) => handleThumbnail(event.target.files?.[0])}
                />
              </label>

              <div className="mt-3 overflow-hidden rounded-[22px] border border-dashed border-pink-400/35 bg-black/25">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="preview thumbnail"
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center gap-2 text-sm font-bold text-pink-100/60">
                    🖼️ Belum ada thumbnail dipilih
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-400/40 bg-gradient-to-br from-blue-500/10 via-white/5 to-pink-600/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl">
                  🎥
                </div>

                <div>
                  <h2 className="text-xl font-black">File Video</h2>
                  <p className="mt-1 text-sm leading-6 text-pink-100/60">
                    Pilih video dari galeri atau folder.
                  </p>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-[22px] border border-blue-400/25 bg-black/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                    ▶️
                  </div>

                  <div>
                    <p className="font-black text-white">Pilih File</p>
                    <p className="text-sm text-pink-100/55">
                      MOV, MP4, WEBM
                    </p>
                  </div>
                </div>

                <span className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-700 px-4 py-3 text-sm font-black text-white">
                  Galeri
                </span>

                <input
                  type="file"
                  accept="video/*,.mp4,.mov,.webm,.m4v,.3gp,.mkv"
                  className="hidden"
                  onChange={(event) => handleVideo(event.target.files?.[0])}
                />
              </label>

              <div className="mt-3 rounded-[22px] border border-dashed border-blue-400/35 bg-black/25 p-4 text-center text-sm font-bold text-pink-100/65">
                {videoFile ? `🎬 ${videoFile.name}` : "🎞️ Belum ada video dipilih"}
              </div>
            </div>

            <select
              className="w-full rounded-[22px] border border-pink-400/35 bg-white/5 p-4 font-black text-white outline-none"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Gratis">Gratis</option>
              <option value="VIP">VIP</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDownloadEnabled((value) => !value)}
                className={[
                  "rounded-[22px] p-4 font-black text-white transition",
                  downloadEnabled
                    ? "bg-gradient-to-r from-sky-400 to-blue-700"
                    : "bg-white/10",
                ].join(" ")}
              >
                ⬇ Download {downloadEnabled ? "Aktif" : "Mati"}
              </button>

              <button
                onClick={() => setCommentsEnabled((value) => !value)}
                className={[
                  "rounded-[22px] p-4 font-black text-white transition",
                  commentsEnabled
                    ? "bg-gradient-to-r from-pink-500 to-purple-700"
                    : "bg-white/10",
                ].join(" ")}
              >
                💬 Komentar {commentsEnabled ? "Aktif" : "Mati"}
              </button>
            </div>

            <button
              onClick={uploadContent}
              disabled={loading}
              className="jasky-button w-full rounded-[22px] py-4 text-lg disabled:opacity-60"
            >
              {loading ? "Mengubah video jadi MP4..." : "⬆ Upload Konten"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[34px] border border-pink-400/30 bg-black/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black">Konten Saya</h2>
              <p className="mt-1 text-sm text-pink-100/50">
                Kelola video yang sudah diupload.
              </p>
            </div>

            <button
              onClick={deleteBrokenContents}
              className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-black text-red-200"
            >
              🗑 Hapus Tanpa Video
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {contents.length === 0 ? (
              <div className="rounded-[28px] border border-pink-400/25 bg-white/5 p-8 text-center">
                <p className="text-5xl">🎬</p>
                <h3 className="mt-3 text-xl font-black">Belum ada konten</h3>
                <p className="mt-2 text-pink-100/55">
                  Konten yang diupload akan muncul di sini.
                </p>
              </div>
            ) : (
              contents.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[28px] border border-pink-400/25 bg-black/70"
                >
                  <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                    <div className="aspect-video bg-black md:aspect-square">
                      {thumb(item) ? (
                        <img
                          src={thumb(item)}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          🎬
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-black">{item.title}</h3>
                          <p className="mt-1 text-sm text-pink-100/60">
                            <span className="font-black text-sky-200">
                              {item.category || "Gratis"}
                            </span>{" "}
                            • {item.mediaName || "Tidak ada video"}
                          </p>
                        </div>

                        <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-100">
                          {item.videoUrl || item.videoBlobKey
                            ? "MP4 Ready"
                            : "Cuma Thumbnail"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl bg-white/10 p-3">
                          👁 {item.views || 0}
                          <p className="mt-1 text-[11px] text-pink-100/45">
                            Views
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-3">
                          👍 {item.likes || 0}
                          <p className="mt-1 text-[11px] text-pink-100/45">
                            Likes
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-3">
                          💬 {(item.comments || []).length}
                          <p className="mt-1 text-[11px] text-pink-100/45">
                            Komentar
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteContent(item)}
                        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-400 to-rose-700 p-4 font-black text-white"
                      >
                        🗑 Hapus Konten
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
