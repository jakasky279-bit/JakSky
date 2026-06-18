"use client";

import { useEffect, useMemo, useState } from "react";

type VideoItem = {
  id: string;
  url: string;
  filename: string;
  order: number;
};

type CommentItem = {
  id: string;
  user: string;
  title?: string;
  role?: string;
  email?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
  text: string;
  createdAt: string;
  hidden?: boolean;
};

type ProfilePreview = {
  username: string;
  email?: string;
  title?: string;
  role?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
};

type ContentItem = {
  id: string;
  title: string;
  description?: string;
  thumbnailDataUrl?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  videoUrl?: string;
  mediaUrl?: string;
  fileUrl?: string;
  mediaDataUrl?: string;
  filename?: string;
  mediaName?: string;
  isVip?: boolean;
  vip?: boolean;
  vipKey?: string;
  keyVip?: string;
  expiredAt?: string;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  createdAt?: string;
  videos?: any[];
  content_videos?: any[];
  views?: number;
  likes?: number;
  unlikes?: number;
  ratings?: any[];
  comments?: CommentItem[];
};

type Account = {
  id?: string;
  username?: string;
  email?: string;
  title?: string;
  role?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
};

const FILTERS = ["Semua", "Terbaru", "Favorit", "Trending", "VIP", "Expired"];

function getJSON<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function setContents(contents: ContentItem[]) {
  localStorage.setItem("jasky_contents", JSON.stringify(contents));
  window.dispatchEvent(new Event("jasky-sync"));
}

function getThumbnail(item: ContentItem) {
  return item.thumbnailUrl || item.thumbnailDataUrl || item.thumbnail_url || "";
}

function normalizeVideo(video: any, index: number): VideoItem | null {
  const url =
    video?.videoUrl ||
    video?.video_url ||
    video?.url ||
    video?.mediaDataUrl ||
    video?.mediaUrl ||
    video?.fileUrl;

  if (!url) return null;

  return {
    id: String(video?.id || `video-${index + 1}`),
    url: String(url),
    filename: String(video?.filename || video?.name || video?.title || `Video ${index + 1}`),
    order: Number(video?.order || video?.position || index + 1),
  };
}

function getVideos(item: ContentItem): VideoItem[] {
  const raw = [
    ...(Array.isArray(item.videos) ? item.videos : []),
    ...(Array.isArray(item.content_videos) ? item.content_videos : []),
  ];

  const list = raw
    .map((video, index) => normalizeVideo(video, index))
    .filter(Boolean) as VideoItem[];

  const fallbackUrl = item.videoUrl || item.mediaDataUrl || item.mediaUrl || item.fileUrl;

  if (fallbackUrl) {
    list.push({
      id: "main-video",
      url: fallbackUrl,
      filename: item.filename || item.mediaName || "Video utama",
      order: 0,
    });
  }

  const unique = new Map<string, VideoItem>();
  for (const video of list) {
    if (!unique.has(video.url)) unique.set(video.url, video);
  }

  return Array.from(unique.values()).sort((a, b) => a.order - b.order);
}

function isExpired(item: ContentItem) {
  if (!item.expiredAt) return false;
  return new Date(item.expiredAt).getTime() < Date.now();
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
}

function cleanRole(role?: string) {
  const value = String(role || "").toLowerCase();
  if (value === "owner") return "Owner";
  if (value === "admin") return "Admin";
  if (value === "moderator") return "Moderator";
  return "User";
}

function getNiceTitle(profile?: any) {
  const title = String(profile?.title || "").trim();
  const role = String(profile?.role || "").toLowerCase();

  if (title && title.toLowerCase() !== "member jasky") return title;
  if (role === "owner") return "Owner JakSky";
  if (role === "admin") return "Admin JakSky";
  if (role === "moderator") return "Moderator JakSky";
  return "Member JakSky";
}

function findProfileFromComment(comment: CommentItem): ProfilePreview {
  const accounts = getJSON<Account[]>("jasky_accounts", []);
  const current = getJSON<Account | null>("jasky_current_user", null);

  const all = [
    ...(Array.isArray(accounts) ? accounts : []),
    ...(current ? [current] : []),
  ];

  const match = all.find((account) => {
    const userMatch =
      account.username &&
      comment.user &&
      account.username.toLowerCase() === comment.user.toLowerCase();

    const emailMatch =
      account.email &&
      comment.email &&
      account.email.toLowerCase() === comment.email.toLowerCase();

    return userMatch || emailMatch;
  });

  return {
    username: match?.username || comment.user || "User JakSky",
    email: match?.email || comment.email || "",
    role: match?.role || comment.role || "",
    title: getNiceTitle(match || comment),
    isVip: Boolean(match?.isVip || comment.isVip || match?.role === "owner"),
    avatar: match?.avatar || comment.avatar || "",
    bio:
      match?.bio ||
      comment.bio ||
      (match?.role === "admin"
        ? "Akun admin JakSky. Bertugas mengelola dan mengupload konten."
        : match?.role === "owner"
          ? "Pemilik platform JakSky."
          : "Member JakSky."),
  };
}

export default function UserPage() {
  const [contents, setLocalContents] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [profilePreview, setProfilePreview] = useState<ProfilePreview | null>(null);

  function load() {
    setLocalContents(getJSON<ContentItem[]>("jasky_contents", []));
    setCurrentUser(getJSON<Account | null>("jasky_current_user", null));
  }

  useEffect(() => {
    load();

    const sync = () => load();
    window.addEventListener("storage", sync);
    window.addEventListener("jasky-sync", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jasky-sync", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const favorites = getJSON<Record<string, boolean>>("jasky_favorites", {});
  const ratings = getJSON<Record<string, number>>("jasky_ratings", {});
  const reactions = getJSON<Record<string, "like" | "unlike">>("jasky_reactions", {});
  const selectedReaction = selected ? reactions[selected.id] : "";

  const filteredContents = useMemo(() => {
    let list = [...contents];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) => {
        return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      });
    }

    if (filter === "Terbaru") {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    if (filter === "Favorit") {
      list = list.filter((item) => favorites[item.id]);
    }

    if (filter === "Trending") {
      list.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
    }

    if (filter === "VIP") {
      list = list.filter((item) => item.isVip || item.vip);
    }

    if (filter === "Expired") {
      list = list.filter((item) => isExpired(item));
    }

    return list;
  }, [contents, query, filter]);

  function updateContent(nextItem: ContentItem) {
    const next = contents.map((item) => (item.id === nextItem.id ? nextItem : item));
    setLocalContents(next);
    setContents(next);
    setSelected(nextItem);
  }

  function openContent(item: ContentItem) {
    const videos = getVideos(item);
    setSelected(item);
    setActiveVideoIndex(0);
    setCommentText("");

    const viewed = getJSON<Record<string, boolean>>("jasky_viewed_content", {});
    const key = `${currentUser?.id || currentUser?.username || "guest"}:${item.id}`;

    if (!viewed[key]) {
      viewed[key] = true;
      localStorage.setItem("jasky_viewed_content", JSON.stringify(viewed));

      const nextItem = {
        ...item,
        views: Number(item.views || 0) + 1,
        videoUrl: videos[0]?.url || item.videoUrl,
      };

      const next = contents.map((content) => (content.id === item.id ? nextItem : content));
      setLocalContents(next);
      setContents(next);
      setSelected(nextItem);
    }
  }

  function toggleFavorite(id: string) {
    const next = getJSON<Record<string, boolean>>("jasky_favorites", {});
    next[id] = !next[id];
    localStorage.setItem("jasky_favorites", JSON.stringify(next));
    load();
  }

  function react(type: "like" | "unlike") {
    if (!selected) return;

    const reactions = getJSON<Record<string, "like" | "unlike">>("jasky_reactions", {});
    const previous = reactions[selected.id];

    let likes = Number(selected.likes || 0);
    let unlikes = Number(selected.unlikes || 0);

    if (previous === type) {
      if (type === "like") likes = Math.max(0, likes - 1);
      if (type === "unlike") unlikes = Math.max(0, unlikes - 1);
      delete reactions[selected.id];
    } else {
      if (previous === "like") likes = Math.max(0, likes - 1);
      if (previous === "unlike") unlikes = Math.max(0, unlikes - 1);

      if (type === "like") likes += 1;
      if (type === "unlike") unlikes += 1;

      reactions[selected.id] = type;
    }

    localStorage.setItem("jasky_reactions", JSON.stringify(reactions));
    updateContent({ ...selected, likes, unlikes });
  }

  function rate(value: number) {
    if (!selected) return;

    const nextRatings = getJSON<Record<string, number>>("jasky_ratings", {});
    nextRatings[selected.id] = value;
    localStorage.setItem("jasky_ratings", JSON.stringify(nextRatings));
    load();
  }

  function addComment() {
    if (!selected || !commentText.trim()) return;

    const user: Account = currentUser || {};
    const username = user.username || user.email || "User JakSky";

    const newComment: CommentItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user: username,
      email: user.email || "",
      role: user.role || "user",
      title: getNiceTitle(user),
      isVip: Boolean(user.isVip || user.role === "owner"),
      avatar: user.avatar || "",
      bio: user.bio || "",
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    updateContent({
      ...selected,
      comments: [...(selected.comments || []), newComment],
    });

    setCommentText("");
  }

  const selectedVideos = selected ? getVideos(selected) : [];
  const activeVideo = selectedVideos[activeVideoIndex] || selectedVideos[0];
  const visibleComments = (selected?.comments || []).filter((comment) => !comment.hidden);

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[34px] border border-pink-400/20 bg-black/65 p-7 text-center shadow-[0_25px_90px_rgba(0,0,0,.45)]">
          <h1 className="text-6xl font-black">
            ⚡ <span className="bg-gradient-to-r from-pink-400 to-sky-400 bg-clip-text text-transparent">JakSky</span>
          </h1>
          <p className="mt-4 text-lg font-black">Premium Video Gate • VIP Access • Fast Update</p>
          <p className="mx-auto mt-5 inline-flex rounded-full bg-pink-500/15 px-6 py-3 font-black text-pink-100">
            Update video terbaru setiap hari
          </p>
        </section>

        <div className="mt-7 rounded-[32px] border border-pink-300/30 bg-white/[0.09] p-2 shadow-[0_18px_55px_rgba(236,72,153,0.25)] backdrop-blur-2xl">
          <div className="flex items-center gap-3 rounded-[26px] border border-white/10 bg-black/35 px-4 py-4 shadow-inner">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-sky-500 text-lg shadow-lg shadow-pink-500/20">
              🔎
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul video..."
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-base font-bold text-white outline-none ring-0 shadow-none placeholder:text-white/35 focus:border-0 focus:outline-none focus:ring-0"
              style={{ border: 0, boxShadow: "none" }}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black text-white/75 active:scale-95"
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-3 pb-2 pt-3 text-xs font-bold text-white/45">
            <span>{query.trim() ? `Mencari: ${query}` : "Cari berdasarkan judul atau deskripsi"}</span>
            <span>{filteredContents.length} konten</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? "shrink-0 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 px-5 py-3 font-black text-white"
                  : "shrink-0 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-3 font-black text-white"
              }
            >
              {item}
            </button>
          ))}
        </div>

        {filteredContents.length === 0 ? (
          <section className="mt-7 rounded-[32px] border border-pink-400/20 bg-black/65 p-10 text-center">
            <div className="text-6xl">🎬</div>
            <h2 className="mt-4 text-3xl font-black">Belum ada video</h2>
            <p className="mt-3 text-white/55">Konten baru akan muncul setelah admin melakukan upload.</p>
          </section>
        ) : (
          <section className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3">
            {filteredContents.map((item) => {
              const thumb = getThumbnail(item);
              const videos = getVideos(item);

              return (
                <article
                  key={item.id}
                  onClick={() => openContent(item)}
                  className="cursor-pointer overflow-hidden rounded-[28px] border border-pink-400/20 bg-black/60 shadow-xl"
                >
                  <div className="relative aspect-[4/5] bg-black/50">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">🎬</div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-2 text-lg"
                    >
                      {favorites[item.id] ? "❤️" : "🤍"}
                    </button>

                    {(item.isVip || item.vip) && (
                      <span className="absolute right-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                        VIP
                      </span>
                    )}

                    {videos.length > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black">
                        {videos.length} video
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-black">{item.title}</h3>
                    <p className="mt-1 text-xs text-white/45">
                      👁️ {Number(item.views || 0)} • ⭐ {ratings[item.id] || "0.0"}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/80 p-4 backdrop-blur-xl">
          <section className="mx-auto max-w-3xl rounded-[34px] border border-pink-400/25 bg-black/90 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelected(null)}
                className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white/80"
              >
                Tutup
              </button>

              <span className="rounded-2xl border border-pink-400/25 bg-pink-500/10 px-5 py-3 text-sm font-black text-pink-100">
                Siap ditonton
              </span>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-pink-400/25 bg-black">
              {activeVideo?.url ? (
                <video key={activeVideo.url} src={activeVideo.url} controls playsInline className="max-h-[70vh] w-full bg-black" />
              ) : (
                <div className="flex aspect-video items-center justify-center text-6xl">🎬</div>
              )}
            </div>

            {selectedVideos.length > 1 && (
              <div className="mt-4 rounded-3xl border border-sky-400/20 bg-white/5 p-4">
                <p className="mb-3 font-black text-sky-100">
                  Pilih video: {activeVideoIndex + 1}/{selectedVideos.length}
                </p>

                <div className="grid gap-2">
                  {selectedVideos.map((video, index) => (
                    <button
                      key={`${video.url}-${index}`}
                      onClick={() => setActiveVideoIndex(index)}
                      className={
                        activeVideoIndex === index
                          ? "rounded-2xl bg-gradient-to-r from-sky-400 to-purple-700 px-4 py-3 text-left font-black text-white"
                          : "rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left font-bold text-white/70"
                      }
                    >
                      {index + 1}. {video.filename}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h2 className="mt-6 text-3xl font-black">{selected.title}</h2>
            <p className="mt-3 text-white/60">{selected.description || "Belum ada deskripsi untuk konten ini."}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-pink-500/20 px-4 py-2 font-black">
                {selected.isVip || selected.vip ? "VIP" : "Gratis"}
              </span>
              <span className="rounded-full bg-pink-500/20 px-4 py-2 font-black">👁️ {Number(selected.views || 0)}</span>
              <span className="rounded-full bg-pink-500/20 px-4 py-2 font-black">⭐ {ratings[selected.id] || "0.0"}</span>
              <span className="rounded-full bg-pink-500/20 px-4 py-2 font-black">💬 {visibleComments.length}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => react("like")}
                className={
                  selectedReaction === "like"
                    ? "rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 font-black text-white shadow-lg shadow-pink-500/20 ring-2 ring-pink-300/40"
                    : "rounded-2xl bg-white/10 px-5 py-4 font-black text-white/80"
                }
              >
                {selectedReaction === "like" ? "❤️ Disukai" : "🤍 Like"} {selected.likes ? `(${selected.likes})` : ""}
              </button>

              <button
                onClick={() => react("unlike")}
                className={
                  selectedReaction === "unlike"
                    ? "rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 px-5 py-4 font-black text-white shadow-lg shadow-red-500/20 ring-2 ring-amber-300/40"
                    : "rounded-2xl bg-white/10 px-5 py-4 font-black text-white/80"
                }
              >
                {selectedReaction === "unlike" ? "👎 Tidak suka" : "👎 Unlike"} {selected.unlikes ? `(${selected.unlikes})` : ""}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <select
                value={ratings[selected.id] || ""}
                onChange={(e) => rate(Number(e.target.value))}
                className="rounded-2xl border border-pink-400/30 bg-black/40 px-4 py-4 text-white"
              >
                <option value="">Beri rating</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} bintang
                  </option>
                ))}
              </select>

              {selected.downloadEnabled !== false && activeVideo?.url ? (
                <a
                  href={activeVideo.url}
                  download
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 text-center font-black"
                >
                  Download
                </a>
              ) : (
                <button className="rounded-2xl bg-white/10 px-5 py-4 font-black opacity-60">Download Off</button>
              )}
            </div>

            {selected.commentsEnabled !== false && (
              <section className="mt-7">
                <h3 className="text-2xl font-black">Komentar</h3>

                <div className="mt-4 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="min-w-0 flex-1 rounded-2xl border border-pink-400/30 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
                  />
                  <button onClick={addComment} className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 font-black">
                    Kirim
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {visibleComments.length === 0 ? (
                    <p className="rounded-2xl bg-white/5 p-4 text-white/45">Belum ada komentar.</p>
                  ) : (
                    visibleComments.map((comment) => {
                      const profile = findProfileFromComment(comment);

                      return (
                      <article
                        key={comment.id}
                        onClick={() => setProfilePreview(profile)}
                        className="cursor-pointer rounded-3xl border border-white/10 bg-white/10 p-4 transition active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-blue-500" />
                          )}
                          <div>
                            <p className="font-black">{profile.username}</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.title && (
                                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-black text-pink-100">
                                  {profile.title}
                                </span>
                              )}
                              {profile.isVip && (
                                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-black text-pink-100">
                                  VIP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 text-white/80">{comment.text}</p>
                        <p className="mt-3 text-xs text-white/35">{formatDate(comment.createdAt)}</p>
                      </article>
))
                  )}
                </div>
              </section>
            )}
          </section>
        </div>
      )}

      {profilePreview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-5 backdrop-blur-xl">
          <section className="w-full max-w-md rounded-[34px] border border-pink-400/25 bg-black/90 p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {profilePreview.avatar ? (
                  <img
                    src={profilePreview.avatar}
                    alt=""
                    className="h-20 w-20 rounded-[28px] object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400 shadow-lg shadow-pink-500/20" />
                )}

                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-black">{profilePreview.username}</h3>
                  <p className="mt-1 text-sm font-bold text-white/45">
                    {cleanRole(profilePreview.role)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProfilePreview(null)}
                className="rounded-2xl bg-white/10 px-4 py-2 text-xl font-black"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-pink-500/20 px-4 py-2 text-sm font-black text-pink-100">
                {profilePreview.title || "Member JakSky"}
              </span>

              {profilePreview.isVip && (
                <span className="rounded-full bg-yellow-400/20 px-4 py-2 text-sm font-black text-yellow-100">
                  VIP
                </span>
              )}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-bold text-white/45">Bio</p>
              <p className="mt-2 text-white/80">
                {profilePreview.bio || "Belum ada bio profil."}
              </p>
            </div>

            {profilePreview.email && (
              <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white/45">Email</p>
                <p className="mt-2 break-all text-white/80">{profilePreview.email}</p>
              </div>
            )}

            <button
              onClick={() => setProfilePreview(null)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 font-black"
            >
              Tutup Profil
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
