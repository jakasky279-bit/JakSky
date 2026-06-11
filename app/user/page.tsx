"use client";

import Link from "next/link";
import { getLocalVideoUrl, saveLocalVideo } from "../../lib/localVideoStore";
import { useEffect, useMemo, useState } from "react";

type Account = {
  id: string;
  username: string;
  email?: string;
  role: string;
  status: string;
  title?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
  profileBg?: string;
  profileFrame?: string;
};

type Content = {
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
  videoBlobKey?: string;
  mediaName?: string;
  filename?: string;
  category?: string;
  uploadedBy?: string;
  createdAt?: string;
  expiredAt?: string;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  views?: number;
  likes?: number;
  unlikes?: number;
  ratings?: number[];
  comments?: any[];
  videos?: any[];
  content_videos?: any[];
};

const filters = ["Semua", "Terbaru", "Favorit", "Trending", "VIP", "Expired"];

export default function UserPage() {
  const [user, setUser] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState<Content | null>(null);
  const [commentText, setCommentText] = useState("");
  const [reactionSignal, setReactionSignal] = useState(0);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState("");
  const [viewedProfile, setViewedProfile] = useState<any | null>(null);

  function getJSON(key: string, fallback: any) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function loadData() {
    const allAccounts: Account[] = getJSON("jasky_accounts", []);
    const loginId = localStorage.getItem("jasky_login_user_id");
    const savedUser = getJSON("jasky_current_user", null);

    let activeUser: Account | null = null;

    if (loginId) {
      activeUser = allAccounts.find((acc) => acc.id === loginId) || null;
    }

    if (!activeUser && savedUser) {
      activeUser = savedUser;
    }

    if (!activeUser) {
      activeUser = allAccounts.find((acc) => acc.role === "user") || null;
    }

    setAccounts(allAccounts);

    if (activeUser) {
      const fresh =
        allAccounts.find((acc) => acc.id === activeUser?.id) || activeUser;

      setUser(fresh);
      localStorage.setItem("jasky_current_user", JSON.stringify(fresh));
      localStorage.setItem("jasky_login_user_id", fresh.id);
    }

    const loadedContents: Content[] = getJSON("jasky_contents", []);
    setContents(loadedContents);
    setFavorites(getJSON("jasky_favorites", []));

    const autoOpenId = localStorage.getItem("jasky_auto_open_content");

    if (autoOpenId) {
      const found = loadedContents.find((item) => item.id === autoOpenId);

      if (found) {
        setSelected(found);
      }

      localStorage.removeItem("jasky_auto_open_content");
    }
  }

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);


  useEffect(() => {
    let alive = true;
    let objectUrl = "";

    async function loadVideo() {
      setSelectedVideoUrl("");

      if (!selected) return;
      if (video(selected)) return;

      const key = selected.videoBlobKey;

      if (!key) return;

      const url = await getLocalVideoUrl(key);

      if (!alive) return;

      objectUrl = url;
      setSelectedVideoUrl(url);
    }

    loadVideo();

    return () => {
      alive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selected]);


  useEffect(() => {
    let alive = true;
    let objectUrl = "";

    async function loadSelectedVideo() {
      setSelectedVideoUrl("");

      if (!selected) return;
      if (video(selected)) return;
      if (!selected.videoBlobKey) return;

      const url = await getLocalVideoUrl(selected.videoBlobKey);

      if (!alive) return;

      objectUrl = url;
      setSelectedVideoUrl(url);
    }

    loadSelectedVideo();

    return () => {
      alive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selected]);


  function notifyJaskySync() {
    try {
      window.dispatchEvent(new Event("jasky-sync"));
    } catch {}

    try {
      const channel = new BroadcastChannel("jasky-realtime");
      channel.postMessage({ type: "sync", at: Date.now() });
      channel.close();
    } catch {}
  }

  



  function getReactionActorKey() {
    return String(user?.id || user?.username || user?.email || "guest");
  }


  function getMyReaction(item?: Content | null) {
    void reactionSignal;

    if (!item?.id) return "";

    const newer = getJSON("jasky_reactions_by_content", {});
    const legacy = getJSON("jasky_reactions", {});
    const key = getReactionActorKey();

    return newer?.[item.id]?.[key] || legacy?.[item.id] || "";
  }



  function getMyRating(item?: Content | null) {
    if (!item?.id) return 0;

    const newer = getJSON("jasky_ratings_by_content", {});
    const legacy = getJSON("jasky_ratings", {});

    return Number(newer?.[item.id]?.[actorKey()] || legacy?.[item.id] || 0);
  }



  // jasky-realtime-final
  useEffect(() => {
    function syncRealtime() {
      const nextContents: Content[] = getJSON("jasky_contents", []);
      const nextAccounts: Account[] = getJSON("jasky_accounts", []);
      const nextFavorites: string[] = getJSON("jasky_favorites", []);

      setContents(nextContents);
      setAccounts(nextAccounts);
      setFavorites(nextFavorites);

      setSelected((prev) => {
        if (!prev) return prev;
        return nextContents.find((item) => item.id === prev.id) || prev;
      });

      const loginId = localStorage.getItem("jasky_login_user_id");
      const current = getJSON("jasky_current_user", null);

      const fresh =
        nextAccounts.find((acc) => acc.id === loginId) ||
        nextAccounts.find((acc) => acc.id === current?.id) ||
        current;

      if (fresh) {
        setUser(fresh);
      }
    }

    function onSync() {
      syncRealtime();
    }

    window.addEventListener("storage", onSync);
    window.addEventListener("jasky-sync", onSync);

    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel("jasky-realtime");
      channel.onmessage = onSync;
    } catch {}

    const timer = window.setInterval(syncRealtime, 1200);

    return () => {
      window.removeEventListener("storage", onSync);
      window.removeEventListener("jasky-sync", onSync);
      window.clearInterval(timer);

      if (channel) {
        channel.close();
      }
    };
  }, []);


  function saveContents(updated: Content[]) {
    setContents(updated);
    localStorage.setItem("jasky_contents", JSON.stringify(updated));

    setSelected((prev) => {
      if (!prev) return prev;
      return updated.find((item) => item.id === prev.id) || prev;
    });

    notifyJaskySync();
  }




  function thumb(item: Content) {
    return (
      item.thumbnailUrl ||
      item.thumbnailDataUrl ||
      item.thumbnail_url ||
      ""
    );
  }




  function video(item?: Content | null) {
    if (!item) return "";

    const direct =
      item.videoUrl ||
      item.mediaDataUrl ||
      item.mediaUrl ||
      item.fileUrl ||
      "";

    if (
      direct &&
      (direct.startsWith("data:video") ||
        direct.startsWith("http") ||
        direct.startsWith("blob:") ||
        direct.startsWith("/"))
    ) {
      return direct;
    }

    return (
      item.videos?.[0]?.url ||
      item.videos?.[0]?.video_url ||
      item.content_videos?.[0]?.url ||
      item.content_videos?.[0]?.video_url ||
      ""
    );
  }






  function avatarFrameStyle(frame?: string): any {
    const value = String(frame || "none");

    if (!value || value === "none") {
      return {};
    }

    const colors: Record<string, string[]> = {
      neon: ["#ff3db8", "#7c3cff", "#22d3ee"],
      epic: ["#f0abfc", "#a855f7", "#4f46e5"],
      mythic: ["#fff7ad", "#f59e0b", "#f97316"],
      fire: ["#ff004c", "#ff7a00", "#ffee00"],
      ocean: ["#38bdf8", "#2563eb", "#06b6d4"],
      toxic: ["#bef264", "#22c55e", "#14b8a6"],
      royal: ["#fdf2f8", "#ec4899", "#8b5cf6"],
    };

    const c = colors[value] || colors.neon;

    return {
      border: `3px solid ${c[0]}`,
      padding: "3px",
      background: `linear-gradient(135deg, ${c[0]}, ${c[1]}, ${c[2]})`,
      boxShadow: `0 0 0 3px rgba(255,255,255,.08), 0 0 18px ${c[0]}, 0 0 34px ${c[1]}`,
    };
  }


  function visibleFrameStyle(frame?: string): any {
    const value = String(frame || "none");
    if (!value || value === "none") return {};
    const color = value === "mythic" ? "#f59e0b" : value === "fire" ? "#ff004c" : value === "ocean" ? "#38bdf8" : value === "toxic" ? "#22c55e" : value === "royal" ? "#ec4899" : "#ff3db8";
    return {
      border: `4px solid ${color}`,
      padding: "3px",
      boxShadow: `0 0 18px ${color}, 0 0 35px ${color}`,
      background: `linear-gradient(135deg, ${color}, #7c3cff)`,
    };
  }


  function getCommentFrame(name?: string) {
    const key = String(name || "").trim().toLowerCase();

    const current = getJSON("jasky_current_user", null);
    const staff = getJSON("jasky_staff_session", null);
    const savedAccounts = getJSON("jasky_accounts", []);
    const users = [current, staff, ...savedAccounts].filter(Boolean);

    const found = users.find((acc: any) => {
      const ids = [acc.id, acc.username, acc.email]
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase());

      return ids.includes(key);
    });

    const frameMap = getJSON("jasky_profile_frames", {});

    const keys = [
      key,
      found?.id,
      found?.username,
      found?.email,
    ]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());

    for (const item of keys) {
      if (Object.prototype.hasOwnProperty.call(frameMap, item)) {
        return String(frameMap[item] || "none");
      }
    }

    return String(found?.profileFrame || "none");
  }



  function profile(comment: CommentItem) {
    const key = String(comment.user || "").trim().toLowerCase();

    const currentUser = getJSON("jasky_current_user", null);
    const staffUser = getJSON("jasky_staff_session", null);

    const candidates = [
      ...accounts,
      currentUser,
      staffUser,
    ].filter(Boolean);

    const fresh = candidates.find((acc: any) => {
      const id = String(acc.id || "").trim().toLowerCase();
      const username = String(acc.username || "").trim().toLowerCase();
      const email = String(acc.email || "").trim().toLowerCase();

      return key === id || key === username || key === email;
    });

    const role = String(fresh?.role || comment.role || "user").toLowerCase();
    const privateRole = role === "owner" || role === "admin" || role === "moderator";

    return {
      username: fresh?.username || fresh?.email || comment.user || "Guest",
      title:
        fresh?.title ||
        comment.title ||
        (role === "owner"
          ? "Owner JakSky"
          : role === "admin"
          ? "Admin JakSky"
          : role === "moderator"
          ? "Moderator JakSky"
          : "Member JakSky"),
      isVip: fresh?.isVip ?? comment.isVip ?? false,
      avatar: fresh?.avatar || comment.avatar || "",
      bio: privateRole
        ? "Akun staff JakSky. Detail pribadi disembunyikan untuk keamanan."
        : fresh?.bio || comment.bio || "",
      role,
      isPrivate: privateRole,
      profileBg: fresh?.profileBg || comment.profileBg || "purpleLightning",
      profileFrame: getCommentFrame(comment.user),
    };
  }








  function openCommentProfile(comment: CommentItem) {
    const p = profile(comment);

    setViewedProfile({
      username: p.username,
      title: p.title,
      isVip: p.isVip,
      avatar: p.avatar,
      bio: p.bio,
      role: p.role,
      isPrivate: p.isPrivate,
      profileBg: p.profileBg,
      profileFrame: p.profileFrame && p.profileFrame !== "none" ? p.profileFrame : getCommentFrame(comment.user),
    });
  }






  function getProfileBgClass(bg?: string) {
    if (bg === "neon") return "jasky-profile-bg-neon";
    if (bg === "galaxy") return "jasky-profile-bg-galaxy";
    if (bg === "fire") return "jasky-profile-bg-fire";
    if (bg === "ice") return "jasky-profile-bg-ice";
    return "jasky-profile-bg-aurora";
  }

  function avg(item: Content) {
    const ratingByContent = getJSON("jasky_ratings_by_content", {});
    const values = Object.values(ratingByContent[item.id] || {})
      .map((value: any) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    const ratings = values.length ? values : item.ratings || [];

    if (!ratings.length) return "0.0";

    return (
      ratings.reduce((total: number, value: number) => total + Number(value), 0) /
      ratings.length
    ).toFixed(1);
  }





  function expired(item: Content) {
    if (!item.expiredAt) return false;
    return new Date(item.expiredAt).getTime() < Date.now();
  }


  function resumeKey() {
    return `jasky_resume_${user?.id || user?.username || "guest"}`;
  }

  function getResumeSeconds(item?: Content | null) {
    if (!item?.id) return 0;

    const map = getJSON(resumeKey(), {});
    return Number(map[item.id]?.seconds || 0);
  }

  function addHistory(item: Content, seconds = 0, duration = 0) {
    if (!item?.id) return;

    const history = getJSON("jasky_watch_history", []);

    const record = {
      id: item.id,
      title: item.title,
      description: item.description || "",
      thumb: thumb(item),
      category: item.category || "Gratis",
      seconds: Math.floor(seconds || 0),
      duration: Math.floor(duration || 0),
      updatedAt: new Date().toISOString(),
    };

    const next = [
      record,
      ...history.filter((h: any) => h.id !== item.id),
    ].slice(0, 50);

    localStorage.setItem("jasky_watch_history", JSON.stringify(next));
  }

  function saveWatchProgress(item: Content, seconds: number, duration: number) {
    if (!item?.id || seconds < 1) return;

    const map = getJSON(resumeKey(), {});

    map[item.id] = {
      seconds: Math.floor(seconds),
      duration: Math.floor(duration || 0),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(resumeKey(), JSON.stringify(map));
    addHistory(item, seconds, duration);
  }

  function clearWatchProgress(item: Content) {
    if (!item?.id) return;

    const map = getJSON(resumeKey(), {});
    delete map[item.id];

    localStorage.setItem(resumeKey(), JSON.stringify(map));
    addHistory(item, 0, 0);
  }

  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    setFavorites(next);
    localStorage.setItem("jasky_favorites", JSON.stringify(next));
  }



  function avatarFrameClass(frame?: string) {
    const value = String(frame || "none");

    if (value === "none") {
      return "jasky-avatar-plain";
    }

    return `jasky-avatar-ring jasky-avatar-frame jasky-frame-${value}`;
  }

  function openDetail(item: Content) {
    setPlayerReady(false);
    setPlayerError("");
    setSelectedVideoUrl("");

    const history = getJSON("jasky_watch_history", []);
    const historyItem = {
      id: item.id,
      title: item.title,
      description: item.description || "",
      thumb: thumb(item),
      category: item.category || "Gratis",
      seconds: 0,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "jasky_watch_history",
      JSON.stringify([
        historyItem,
        ...history.filter((h: any) => h.id !== item.id),
      ].slice(0, 50))
    );

    const viewed = getJSON("jasky_viewed_content", []);
    const key = `${user?.id || user?.username || "guest"}-${item.id}`;

    if (viewed.includes(key)) {
      setSelected(item);
      return;
    }

    let freshItem = item;

    const next = contents.map((content) => {
      if (content.id !== item.id) return content;

      freshItem = {
        ...content,
        views: (content.views || 0) + 1,
      };

      return freshItem;
    });

    saveContents(next);
    localStorage.setItem("jasky_viewed_content", JSON.stringify([...viewed, key]));
    setSelected(freshItem);
  }





  


  function getMyReaction(item?: Content | null) {
    if (!item?.id) return "";

    const reactions = getJSON("jasky_reactions", {});
    return reactions[`${actorKey()}:${item.id}`] || "";
  }

  function getMyRating(item?: Content | null) {
    if (!item?.id) return "";

    const ratingByContent = getJSON("jasky_ratings_by_content", {});
    const oldRatings = getJSON("jasky_ratings", {});

    return Number(
      ratingByContent[item.id]?.[actorKey()] || oldRatings[item.id] || 0
    );
  }




  function handleJaskyReaction(type: "like" | "unlike") {
    if (!selected) return;

    const key = getReactionActorKey();
    const reactionStore = getJSON("jasky_reactions_by_content", {});
    const contentStore = { ...(reactionStore[selected.id] || {}) };
    const oldReaction = contentStore[key] || "";

    let likesChange = 0;
    let unlikesChange = 0;

    if (oldReaction === type) {
      delete contentStore[key];

      if (type === "like") likesChange = -1;
      if (type === "unlike") unlikesChange = -1;
    } else {
      contentStore[key] = type;

      if (type === "like") {
        likesChange = 1;
        if (oldReaction === "unlike") unlikesChange = -1;
      }

      if (type === "unlike") {
        unlikesChange = 1;
        if (oldReaction === "like") likesChange = -1;
      }
    }

    reactionStore[selected.id] = contentStore;
    localStorage.setItem("jasky_reactions_by_content", JSON.stringify(reactionStore));

    let nextSelected = selected;

    const updated = contents.map((item) => {
      if (item.id !== selected.id) return item;

      nextSelected = {
        ...item,
        likes: Math.max(0, (item.likes || 0) + likesChange),
        unlikes: Math.max(0, (item.unlikes || 0) + unlikesChange),
      };

      return nextSelected;
    });

    saveContents(updated);
    setSelected(nextSelected);
    setReactionSignal((value) => value + 1);
    notifyJaskySync();
  }



  function toggleReaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }



  function reaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }












  function handleJaskyRating(value: number) {
    if (!selected || !value) return;

    const ratingStore = getJSON("jasky_ratings_by_content", {});
    const contentRatings = ratingStore[selected.id] || {};

    contentRatings[actorKey()] = value;
    ratingStore[selected.id] = contentRatings;

    localStorage.setItem("jasky_ratings_by_content", JSON.stringify(ratingStore));

    const allRatings = Object.values(contentRatings)
      .map((item) => Number(item))
      .filter((item) => item > 0);

    const updated = contents.map((item) => {
      if (item.id !== selected.id) return item;

      return {
        ...item,
        ratings: allRatings.length > 0 ? allRatings : [value],
      };
    });

    saveContents(updated);
  }

  function setRating(value: number) {
    handleJaskyRating(value);
  }

  function rate(value: number) {
    handleJaskyRating(value);
  }







  function addComment() {
    if (!selected || !commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: user?.username || "Guest",
      title: user?.title || "Member JakSky",
      isVip: Boolean(user?.isVip),
      avatar: user?.avatar || "",
      bio: user?.bio || "",
      profileBg: user?.profileBg || "purpleLightning",
      profileFrame: user?.profileFrame || "none",
      profileBg: user?.profileBg || "aurora",
      text: commentText.trim(),
      createdAt: new Date().toLocaleString("id-ID"),
    };

    let freshSelected = selected;

    const next = contents.map((item) => {
      if (item.id !== selected.id) return item;

      freshSelected = {
        ...item,
        comments: [...(item.comments || []), newComment],
      };

      return freshSelected;
    });

    saveContents(next);
    setSelected(freshSelected);
    setCommentText("");
    notifyJaskySync();
  }


  async function attachVideoToSelected(file?: File) {
    if (!selected || !file) return;

    if (!file.type.startsWith("video/")) {
      alert("File yang dipilih harus video.");
      return;
    }

    try {
      const key = `jasky-video-${selected.id}-${Date.now()}-${file.name}`;

      await saveLocalVideo(key, file);

      let freshSelected = selected;

      const next = contents.map((item) => {
        if (item.id !== selected.id) return item;

        freshSelected = {
          ...item,
          videoBlobKey: key,
          mediaName: file.name,
        };

        return freshSelected;
      });

      saveContents(next);
      setSelected(freshSelected);

      const url = await getLocalVideoUrl(key);
      setSelectedVideoUrl(url);

      alert("Video berhasil ditempel ke konten ini.");
    } catch (error) {
      alert("Gagal menyimpan video. Coba pakai video yang lebih kecil dulu.");
      console.error(error);
    }
  }


  function downloadVideo() {
    if (!selected) return;

    const src = video(selected) || selectedVideoUrl;

    if (!src) {
      alert("Video belum tersedia untuk didownload.");
      return;
    }

    if (selected.downloadEnabled === false) {
      alert("Download untuk konten ini dimatikan.");
      return;
    }

    const a = document.createElement("a");
    a.href = src;
    a.download = selected.mediaName || selected.filename || "jasky-video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }



  const list = useMemo(() => {
    let data = [...contents];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.uploadedBy?.toLowerCase().includes(q)
      );
    }

    if (filter === "Terbaru") {
      data.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    }

    if (filter === "Favorit") {
      data = data.filter((item) => favorites.includes(item.id));
    }

    if (filter === "Trending") {
      data.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    if (filter === "VIP") {
      data = data.filter((item) => item.category === "VIP");
    }

    if (filter === "Expired") {
      data = data.filter((item) => expired(item));
    }

    return data;
  }, [contents, favorites, filter, search]);


  
  function actorKey() {
    return String(user?.id || user?.username || user?.email || "guest");
  }

  function getActiveReaction(item?: Content | null) {
    if (!item?.id) return "";

    try {
      const key = String(user?.id || user?.username || user?.email || "guest");
      const newer = JSON.parse(localStorage.getItem("jasky_reactions_by_content") || "{}");
      const legacy = JSON.parse(localStorage.getItem("jasky_reactions") || "{}");

      return newer?.[item.id]?.[key] || legacy?.[item.id] || "";
    } catch {
      return "";
    }
  }

  const currentReaction = selected ? getActiveReaction(selected) : "";

  return (
    <main className="min-h-screen pb-28">
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="jasky-card p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl">⚡</span>
            <h1 className="jasky-title text-5xl font-black">JakSky</h1>
          </div>

          <p className="mt-3 font-black text-pink-100">
            Premium Video Gate • VIP Access • Fast Update
          </p>

          <div className="mt-5 inline-flex rounded-full bg-pink-500/15 px-5 py-3 text-sm font-black text-pink-300">
            Update video terbaru setiap hari
          </div>
        </div>

        <div className="relative mt-5">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            className="w-full rounded-[24px] px-14 py-5 text-base font-bold"
            placeholder="Cari video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`shrink-0 ${filter === item ? "jasky-pill jasky-pill-active" : "jasky-pill"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {list.length === 0 ? (
            <div className="jasky-card col-span-2 p-8 text-center md:col-span-3">
              <p className="text-4xl">🎬</p>
              <h2 className="mt-4 text-2xl font-black">Belum ada video</h2>
              <p className="mt-2 text-pink-100/70">
                Konten baru akan muncul setelah admin melakukan upload.
              </p>
            </div>
          ) : (
            list.map((item) => (
              <article
                key={item.id}
                onClick={() => openDetail(item)}
                className="overflow-hidden rounded-[24px] border border-pink-400/25 bg-black/80 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  {thumb(item) ? (
                    <img
                      src={thumb(item)}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-90 transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-900 to-black text-5xl">
                      ▶
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="absolute left-3 top-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-3xl"
                  >
                    {favorites.includes(item.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="bg-gradient-to-t from-black via-black/95 to-black/80 p-3">
                  <h3 className="min-h-[44px] text-sm font-black leading-5 text-white">
                    {item.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-5 gap-1 text-[11px] font-black text-pink-100">
                    <span>⭐ {avg(item)}</span>
                    <span>👁 {item.views || 0}</span>
                    <span>👍 {item.likes || 0}</span>
                    <span>👎 {item.unlikes || 0}</span>
                    <span>💬 {(item.comments || []).filter((c) => !c.hidden).length}</span>
                  </div>

                  <div className="mt-2 inline-flex rounded-full bg-black/35 px-2 py-1 text-[11px] font-black text-blue-100">
                    ⬇ {item.downloadEnabled === false ? "Mati" : "Aktif"}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <Link
        href="/history"
        className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-700 text-2xl shadow-xl"
      >
        🕘
      </Link>

      <Link
        href="/profile"
        className="fixed bottom-6 right-5 z-40 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-4xl"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          "👤"
        )}
      </Link>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl rounded-[30px] border border-pink-400/30 bg-black/95 p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-white/10 px-4 py-2 font-black text-white"
              >
                Tutup
              </button>

              <span className="jasky-badge">
                {playerError
                  ? "Format belum support"
                  : playerReady
                  ? "Siap ditonton"
                  : video(selected) || selectedVideoUrl
                  ? "Memuat video"
                  : "Preview konten"}
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-[28px] border border-pink-400/25 bg-black shadow-[0_20px_60px_rgba(255,77,184,0.18)]">
              {video(selected) || selectedVideoUrl ? (
                <div>
                  <video
                    src={video(selected) || selectedVideoUrl}
                    poster={thumb(selected) || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      const el = event.currentTarget;

                      try {
                        const key = `jasky_resume_${user?.id || user?.username || "guest"}`;
                        const map = getJSON(key, {});
                        const resumeAt = Number(map[selected.id]?.seconds || 0);

                        if (
                          resumeAt > 5 &&
                          Number.isFinite(el.duration) &&
                          resumeAt < el.duration - 5
                        ) {
                          el.currentTime = resumeAt;
                        }
                      } catch {}

                      setPlayerReady(true);
                      setPlayerError("");
                    }}
                    onCanPlay={() => {
                      setPlayerReady(true);
                      setPlayerError("");
                    }}
                    onTimeUpdate={(event) => {
                      const el = event.currentTarget;

                      if (!selected || el.currentTime < 1) return;

                      try {
                        const key = `jasky_resume_${user?.id || user?.username || "guest"}`;
                        const map = getJSON(key, {});

                        map[selected.id] = {
                          seconds: Math.floor(el.currentTime),
                          duration: Number.isFinite(el.duration)
                            ? Math.floor(el.duration)
                            : 0,
                          updatedAt: new Date().toISOString(),
                        };

                        localStorage.setItem(key, JSON.stringify(map));

                        const history = getJSON("jasky_watch_history", []);

                        localStorage.setItem(
                          "jasky_watch_history",
                          JSON.stringify([
                            {
                              id: selected.id,
                              title: selected.title,
                              description: selected.description || "",
                              thumb: thumb(selected),
                              category: selected.category || "Gratis",
                              seconds: Math.floor(el.currentTime),
                              duration: Number.isFinite(el.duration)
                                ? Math.floor(el.duration)
                                : 0,
                              updatedAt: new Date().toISOString(),
                            },
                            ...history.filter((h: any) => h.id !== selected.id),
                          ].slice(0, 50))
                        );
                      } catch {}
                    }}
                    onEnded={() => {
                      try {
                        const key = `jasky_resume_${user?.id || user?.username || "guest"}`;
                        const map = getJSON(key, {});
                        delete map[selected.id];
                        localStorage.setItem(key, JSON.stringify(map));
                      } catch {}
                    }}
                    onError={() => {
                      setPlayerReady(false);
                      setPlayerError(
                        "Format video ini belum bisa diputar di browser. Upload ulang lewat admin supaya diproses menjadi MP4."
                      );
                    }}
                    className="aspect-video w-full bg-black object-contain"
                  />

                  {playerError && (
                    <div className="p-4">
                      <p className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">
                        {playerError}
                      </p>
                    </div>
                  )}
                </div>
              ) : thumb(selected) ? (
                <div>
                  <img
                    src={thumb(selected)}
                    alt={selected.title}
                    className="w-full"
                  />

                  <div className="p-4">
                    <p className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">
                      Video untuk konten ini belum tersambung dari admin upload.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center text-5xl">
                  ▶
                </div>
              )}
            </div>

            <h2 className="mt-5 text-2xl font-black">{selected.title}</h2>

            <p className="mt-2 leading-7 text-pink-100/70">
              {selected.description || "Belum ada deskripsi untuk konten ini."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="jasky-badge">{selected.category || "Gratis"}</span>
              <span className="jasky-badge">👁 {selected.views || 0}</span>
              <span className="jasky-badge">⭐ {avg(selected)}</span>
              <span className="jasky-badge">
                💬 {(selected.comments || []).filter((c) => !c.hidden).length}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                                          
              
                            <button
                onClick={() => toggleReaction("like")}
                className={[
                  "rounded-2xl p-4 font-black transition border shadow-lg",
                  currentReaction === "like"
                    ? "border-red-300 bg-gradient-to-r from-red-500 via-pink-500 to-rose-700 text-white shadow-[0_0_35px_rgba(244,63,94,.55)] scale-[1.02]"
                    : "border-white/10 bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                {currentReaction === "like" ? "❤️ Like" : "🤍 Like"}
              </button>

                                          
              
                                          <button
                onClick={() => toggleReaction("unlike")}
                className={[
                  "rounded-2xl p-4 font-black transition border shadow-lg",
                  currentReaction === "unlike"
                    ? "border-orange-300 bg-gradient-to-r from-orange-500 via-red-500 to-rose-800 text-white shadow-[0_0_35px_rgba(249,115,22,.45)] scale-[1.02]"
                    : "border-white/10 bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                {currentReaction === "unlike" ? "💔 Unlike" : "👎 Unlike"}
              </button>

                                          <select
                className="rounded-2xl p-4 font-black"
                value={selected ? String(getMyRating(selected) || "") : ""}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value="" disabled>
                  Beri rating
                </option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐ 2</option>
                <option value="3">⭐ 3</option>
                <option value="4">⭐ 4</option>
                <option value="5">⭐ 5</option>
              </select>

              <button onClick={downloadVideo} className="jasky-button p-4">
                Download
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-black">Komentar</h3>

              {selected.commentsEnabled === false ? (
                <p className="mt-3 text-pink-100/70">
                  Komentar dimatikan untuk konten ini.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      className="flex-1 rounded-2xl px-4 py-3"
                      placeholder="Tulis komentar..."
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                    />

                    <button onClick={addComment} className="jasky-button px-5">
                      Kirim
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {(selected.comments || [])
                      .filter((comment) => !comment.hidden)
                      .map((comment) => {
                        const p = profile(comment);

                        return (
                          <div
                            key={comment.id}
                            onClick={() => openCommentProfile(comment)}
                            className="cursor-pointer rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`${avatarFrameClass(p.profileFrame)} flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 text-xl`} style={visibleFrameStyle(p.profileFrame && p.profileFrame !== "none" ? p.profileFrame : getCommentFrame(p.username || comment.user))}>
                                {p.avatar ? (
                                  <img
                                    src={p.avatar}
                                    alt={p.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "👤"
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black">{p.username}</p>

                                  <span className="jasky-badge">{p.title}</span>

                                  {p.isVip && (
                                    <span className="jasky-badge">VIP</span>
                                  )}
                                </div>

                                {p.bio && (
                                  <p className="mt-1 text-xs font-bold text-pink-100/45">
                                    {p.bio}
                                  </p>
                                )}

                                <p className="mt-2 text-pink-100/80">
                                  {comment.text}
                                </p>

                                <p className="mt-2 text-xs text-pink-100/40">
                                  {comment.createdAt}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {viewedProfile && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 px-4 py-8 backdrop-blur-xl">
          <div className="mx-auto max-w-md overflow-hidden rounded-[32px] border border-pink-400/30 bg-black/95 shadow-2xl">
            <div className={["relative px-5 pb-8 pt-5 text-center", getProfileBgClass(viewedProfile.profileBg)].join(" ")}>
              <div className="absolute inset-0 bg-black/15" />

              {viewedProfile.isSelf && (
                <span className="absolute left-4 top-4 rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur">
                  Ini profil kamu
                </span>
              )}

              <button
                onClick={() => setViewedProfile(null)}
                className="absolute right-4 top-4 rounded-full bg-black/45 px-4 py-2 text-sm font-black text-white backdrop-blur"
              >
                Tutup
              </button>

              <div className={`${avatarFrameClass(viewedProfile.profileFrame)} flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 text-xl`} style={visibleFrameStyle(viewedProfile.profileFrame && viewedProfile.profileFrame !== "none" ? viewedProfile.profileFrame : getCommentFrame(viewedProfile.username))}>
                {viewedProfile.avatar ? (
                  <img
                    src={viewedProfile.avatar}
                    alt={viewedProfile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>
            </div>

            <div className="px-5 pb-6 pt-5 text-center">
              <h2 className="text-4xl font-black text-white">
                {viewedProfile.username}
              </h2>

              <p className="mt-1 text-sm font-bold text-pink-100/60">
                {viewedProfile.isPrivate ? "Private Account" : "Public Profile"}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {viewedProfile.isPrivate && (
                  <span className="rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-xs font-black text-red-200">
                    Private Account
                  </span>
                )}

                <span className="jasky-badge">
                  {String(viewedProfile.role || "user").toLowerCase() === "owner"
                    ? "Owner"
                    : String(viewedProfile.role || "user").toLowerCase() === "admin"
                    ? "Admin"
                    : String(viewedProfile.role || "user").toLowerCase() === "moderator"
                    ? "Moderator"
                    : viewedProfile.title || "Member JakSky"}
                </span>

                {!viewedProfile.isPrivate && (
                  <span className="jasky-badge">
                    {viewedProfile.isVip ? "VIP Member" : "User Gratis"}
                  </span>
                )}

                <span className="jasky-badge">
                  Status: {viewedProfile.status || "active"}
                </span>
              </div>

              <div className="mt-5 rounded-[24px] border border-pink-400/20 bg-white/10 p-4 text-left">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-200/70">
                  Bio
                </p>

                <p className="mt-3 leading-7 text-pink-100/80">
                  {viewedProfile.isPrivate
                    ? "Akun ini adalah akun staff JakSky. Detail pribadi disembunyikan untuk keamanan."
                    : viewedProfile.bio || "User ini belum menambahkan bio."}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-black">
                    {viewedProfile.isPrivate
                      ? "Staff"
                      : viewedProfile.isVip
                      ? "VIP"
                      : "Free"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-pink-100/50">
                    Akses akun
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-black capitalize">
                    {viewedProfile.role || "user"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-pink-100/50">
                    Role
                  </p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs font-bold text-pink-100/40">
                Informasi pribadi seperti email dan kata sandi tidak ditampilkan.
              </p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
