"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Account = {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  title?: string;
  avatar?: string;
};

type CommentItem = {
  id?: string;
  user?: string;
  username?: string;
  title?: string;
  avatar?: string;
  text?: string;
  createdAt?: string;
  hidden?: boolean;
  replyTo?: string;
};

type Content = {
  id: string;
  title: string;
  comments?: CommentItem[];
};

type Row = {
  contentId: string;
  contentTitle: string;
  comment: CommentItem;
  index: number;
};

type CsReply = {
  id: string;
  from: string;
  text: string;
  createdAt: string;
};

type CsMessage = {
  id: string;
  user: string;
  userKey?: string;
  text: string;
  createdAt: string;
  status?: "baru" | "diproses" | "selesai";
  replies?: CsReply[];
};

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveContents(contents: Content[]) {
  localStorage.setItem("jasky_contents", JSON.stringify(contents));
  window.dispatchEvent(new Event("jasky-sync"));
}

function saveCsMessages(messages: CsMessage[]) {
  localStorage.setItem("jasky_cs_messages", JSON.stringify(messages));
  window.dispatchEvent(new Event("jasky-sync"));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeDate(value?: string) {
  if (!value) return "Baru saja";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Baru saja";
  return d.toLocaleString("id-ID");
}

export default function ModeratorPage() {
  const [tab, setTab] = useState<"komentar" | "cs">("komentar");
  const [contents, setContents] = useState<Content[]>([]);
  const [session, setSession] = useState<Account | null>(null);
  const [filter, setFilter] = useState<"semua" | "aktif" | "hidden">("semua");
  const [replyTarget, setReplyTarget] = useState<Row | null>(null);
  const [replyText, setReplyText] = useState("");

  const [csMessages, setCsMessages] = useState<CsMessage[]>([]);
  const [csTarget, setCsTarget] = useState<CsMessage | null>(null);
  const [csReplyText, setCsReplyText] = useState("");

  function loadData() {
    setContents(getJSON<Content[]>("jasky_contents", []));
    setCsMessages(getJSON<CsMessage[]>("jasky_cs_messages", []));
    setSession(
      getJSON<Account | null>("jasky_staff_session", null) ||
        getJSON<Account | null>("jasky_current_user", null)
    );
  }

  useEffect(() => {
    loadData();

    const sync = () => loadData();
    window.addEventListener("storage", sync);
    window.addEventListener("jasky-sync", sync);

    const timer = window.setInterval(sync, 1000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jasky-sync", sync);
      window.clearInterval(timer);
    };
  }, []);

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];

    contents.forEach((content) => {
      (content.comments || []).forEach((comment, index) => {
        list.push({
          contentId: content.id,
          contentTitle: content.title || "Tanpa Judul",
          comment,
          index,
        });
      });
    });

    return list
      .filter((row) => {
        if (filter === "aktif") return !row.comment.hidden;
        if (filter === "hidden") return !!row.comment.hidden;
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.comment.createdAt || 0).getTime();
        const db = new Date(b.comment.createdAt || 0).getTime();
        return db - da;
      });
  }, [contents, filter]);

  const commentTotal = useMemo(() => {
    const all = contents.flatMap((content) => content.comments || []);
    return {
      semua: all.length,
      aktif: all.filter((c) => !c.hidden).length,
      hidden: all.filter((c) => c.hidden).length,
    };
  }, [contents]);

  const csTotal = useMemo(() => {
    return {
      semua: csMessages.length,
      baru: csMessages.filter((m) => !m.status || m.status === "baru").length,
      proses: csMessages.filter((m) => m.status === "diproses").length,
      selesai: csMessages.filter((m) => m.status === "selesai").length,
    };
  }, [csMessages]);

  function updateComment(row: Row, updater: (comment: CommentItem) => CommentItem) {
    const updated = contents.map((content) => {
      if (content.id !== row.contentId) return content;

      const comments = (content.comments || []).map((comment, i) => {
        const same = row.comment.id ? comment.id === row.comment.id : i === row.index;
        return same ? updater(comment) : comment;
      });

      return { ...content, comments };
    });

    setContents(updated);
    saveContents(updated);
  }

  function deleteComment(row: Row) {
    const ok = confirm("Hapus komentar ini?");
    if (!ok) return;

    const updated = contents.map((content) => {
      if (content.id !== row.contentId) return content;

      const comments = (content.comments || []).filter((comment, i) => {
        if (row.comment.id) return comment.id !== row.comment.id;
        return i !== row.index;
      });

      return { ...content, comments };
    });

    setContents(updated);
    saveContents(updated);
  }

  function toggleHidden(row: Row) {
    updateComment(row, (comment) => ({
      ...comment,
      hidden: !comment.hidden,
    }));
  }

  function sendCommentReply() {
    if (!replyTarget) return;
    if (!replyText.trim()) return;

    const name = session?.username || session?.email || "Moderator";

    const reply: CommentItem = {
      id: makeId("comment"),
      user: name,
      username: name,
      title:
        session?.role === "owner"
          ? "Owner JakSky"
          : session?.role === "admin"
          ? "Admin JakSky"
          : "Moderator JakSky",
      avatar: session?.avatar || "",
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
      hidden: false,
      replyTo: replyTarget.comment.id,
    };

    const updated = contents.map((content) => {
      if (content.id !== replyTarget.contentId) return content;

      return {
        ...content,
        comments: [...(content.comments || []), reply],
      };
    });

    setContents(updated);
    saveContents(updated);
    setReplyTarget(null);
    setReplyText("");
  }

  function updateCsStatus(id: string, status: "baru" | "diproses" | "selesai") {
    const next = csMessages.map((msg) => {
      if (msg.id !== id) return msg;
      return { ...msg, status };
    });

    setCsMessages(next);
    saveCsMessages(next);
  }

  function sendCsReply() {
    if (!csTarget) return;
    if (!csReplyText.trim()) return;

    const from = session?.username || session?.email || "Moderator JakSky";

    const reply: CsReply = {
      id: makeId("cs-reply"),
      from,
      text: csReplyText.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = csMessages.map((msg) => {
      if (msg.id !== csTarget.id) return msg;

      return {
        ...msg,
        status: "diproses" as const,
        replies: [...(msg.replies || []), reply],
      };
    });

    setCsMessages(next);
    saveCsMessages(next);
    setCsTarget(null);
    setCsReplyText("");
  }

  function deleteCsMessage(id: string) {
    const ok = confirm("Hapus pesan CS ini?");
    if (!ok) return;

    const next = csMessages.filter((msg) => msg.id !== id);
    setCsMessages(next);
    saveCsMessages(next);
  }

  function logoutStaff() {
    localStorage.removeItem("jasky_staff_session");
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[34px] border border-pink-400/25 bg-black/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-pink-200/70">
                JakSky Staff
              </p>
              <h1 className="mt-2 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-4xl font-black text-transparent">
                Moderator Panel
              </h1>
              <p className="mt-2 text-white/60">
                Kelola komentar dan Customer Service dari satu panel.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/user" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-black text-white">
                User
              </Link>

              <button
                type="button"
                onClick={logoutStaff}
                className="rounded-2xl border border-red-400/30 bg-red-500/20 px-4 py-3 font-black text-red-100"
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTab("komentar")}
              className={
                tab === "komentar"
                  ? "rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-4 font-black text-white"
                  : "rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white"
              }
            >
              💬 Komentar
            </button>

            <button
              type="button"
              onClick={() => setTab("cs")}
              className={
                tab === "cs"
                  ? "rounded-2xl bg-gradient-to-r from-blue-500 to-purple-700 px-4 py-4 font-black text-white"
                  : "rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white"
              }
            >
              🎧 CS Inbox
            </button>
          </div>
        </section>

        {tab === "komentar" && (
          <>
            <section className="mt-6 rounded-[30px] border border-pink-400/20 bg-black/45 p-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                  <p className="text-3xl font-black">{commentTotal.semua}</p>
                  <p className="text-xs font-bold text-white/50">Semua</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                  <p className="text-3xl font-black">{commentTotal.aktif}</p>
                  <p className="text-xs font-bold text-white/50">Aktif</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                  <p className="text-3xl font-black">{commentTotal.hidden}</p>
                  <p className="text-xs font-bold text-white/50">Hidden</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {(["semua", "aktif", "hidden"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={
                      filter === item
                        ? "rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-3 font-black capitalize text-white"
                        : "rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-black capitalize text-white"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6 space-y-4">
              {rows.length === 0 ? (
                <div className="rounded-[30px] border border-white/10 bg-black/45 p-8 text-center text-white/60">
                  Belum ada komentar.
                </div>
              ) : (
                rows.map((row) => {
                  const comment = row.comment;
                  const name = comment.user || comment.username || "User";
                  const title = comment.title || "Member JakSky";

                  return (
                    <article
                      key={`${row.contentId}-${comment.id || row.index}`}
                      className="rounded-[30px] border border-pink-400/20 bg-black/45 p-5 shadow-[0_18px_55px_rgba(0,0,0,.35)]"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200/50">Konten</p>
                      <h2 className="mt-1 text-xl font-black">{row.contentTitle}</h2>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 text-2xl">
                            {comment.avatar ? <img src={comment.avatar} alt="" className="h-full w-full object-cover" /> : "👤"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-all text-lg font-black">{name}</p>
                              <span className="rounded-full border border-pink-300/25 bg-pink-500/15 px-3 py-1 text-xs font-black text-pink-100">
                                {title}
                              </span>
                              {comment.hidden && (
                                <span className="rounded-full border border-yellow-300/25 bg-yellow-500/15 px-3 py-1 text-xs font-black text-yellow-100">
                                  Hidden
                                </span>
                              )}
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-lg text-white/85">{comment.text || "-"}</p>
                            <p className="mt-3 text-xs text-white/35">{safeDate(comment.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTarget(row);
                            setReplyText("");
                          }}
                          className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 font-black text-white"
                        >
                          Balas
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleHidden(row)}
                          className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 font-black text-black"
                        >
                          {comment.hidden ? "Tampilkan" : "Sembunyikan"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteComment(row)}
                          className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-700 px-4 py-3 font-black text-white"
                        >
                          Hapus
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}

        {tab === "cs" && (
          <>
            <section className="mt-6 rounded-[30px] border border-blue-400/20 bg-black/45 p-5">
              <h2 className="text-3xl font-black">🎧 CS Inbox</h2>
              <p className="mt-2 text-white/55">
                Pesan dari halaman awal, register, dan login masuk ke sini.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
                  <p className="text-2xl font-black">{csTotal.semua}</p>
                  <p className="text-xs text-white/50">Semua</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
                  <p className="text-2xl font-black">{csTotal.baru}</p>
                  <p className="text-xs text-white/50">Baru</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
                  <p className="text-2xl font-black">{csTotal.proses}</p>
                  <p className="text-xs text-white/50">Proses</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
                  <p className="text-2xl font-black">{csTotal.selesai}</p>
                  <p className="text-xs text-white/50">Selesai</p>
                </div>
              </div>
            </section>

            <section className="mt-6 space-y-4">
              {csMessages.length === 0 ? (
                <div className="rounded-[30px] border border-white/10 bg-black/45 p-8 text-center text-white/60">
                  Belum ada pesan Customer Service.
                </div>
              ) : (
                csMessages.map((msg) => (
                  <article
                    key={msg.id}
                    className="rounded-[30px] border border-blue-400/20 bg-black/50 p-5 shadow-[0_18px_55px_rgba(0,0,0,.35)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/50">User</p>
                        <h3 className="mt-1 break-all text-xl font-black">{msg.user || "Guest JakSky"}</h3>
                        <p className="mt-1 text-xs text-white/35">{safeDate(msg.createdAt)}</p>
                      </div>

                      <span className="rounded-full border border-blue-300/20 bg-blue-500/15 px-3 py-2 text-xs font-black text-blue-100">
                        {msg.status || "baru"}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="whitespace-pre-wrap text-white/85">{msg.text}</p>
                    </div>

                    {(msg.replies || []).length > 0 && (
                      <div className="mt-4 space-y-3">
                        {(msg.replies || []).map((reply) => (
                          <div key={reply.id} className="rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4">
                            <p className="text-sm font-black text-pink-100">{reply.from}</p>
                            <p className="mt-2 whitespace-pre-wrap text-white/80">{reply.text}</p>
                            <p className="mt-2 text-xs text-white/35">{safeDate(reply.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCsTarget(msg);
                          setCsReplyText("");
                        }}
                        className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 font-black text-white"
  >
                        Balas
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCsStatus(msg.id, "diproses")}
                        className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 font-black text-black"
                      >
                        Proses
                      </button>

                      <button
                        type="button"
                        onClick={() => updateCsStatus(msg.id, "selesai")}
                        className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-700 px-4 py-3 font-black text-white"
                      >
                        Selesai
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCsMessage(msg.id)}
                        className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-700 px-4 py-3 font-black text-white"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </div>

      {replyTarget && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-pink-400/30 bg-[#130812] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
            <div className="bg-gradient-to-r from-pink-600 via-purple-700 to-blue-700 p-5">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">
                Balas Komentar
              </p>
              <h2 className="mt-2 break-all text-2xl font-black">
                {replyTarget.comment.user || replyTarget.comment.username || "User"}
              </h2>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200/50">
                  Komentar user
                </p>
                <p className="mt-2 text-white/80">
                  {replyTarget.comment.text || "-"}
                </p>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan moderator..."
                autoFocus
                className="mt-4 min-h-36 w-full rounded-2xl border border-pink-400/25 bg-black/35 p-4 text-white outline-none placeholder:text-white/35 focus:border-pink-300"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReplyTarget(null);
                    setReplyText("");
                  }}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={sendCommentReply}
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-4 font-black text-white"
                >
                  Kirim Balasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {csTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-blue-400/30 bg-[#090b18] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
            <div className="bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 p-5">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">
                Balas Customer Service
              </p>
              <h2 className="mt-2 break-all text-2xl font-black">
                {csTarget.user || "Guest JakSky"}
              </h2>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/50">
                  Pesan User
                </p>
                <p className="mt-2 whitespace-pre-wrap text-white/80">
                  {csTarget.text || "-"}
                </p>
              </div>

              <textarea
                value={csReplyText}
                onChange={(e) => setCsReplyText(e.target.value)}
                placeholder="Tulis balasan CS..."
                autoFocus
                className="mt-4 min-h-36 w-full rounded-2xl border border-blue-400/25 bg-black/35 p-4 text-white outline-none placeholder:text-white/35 focus:border-blue-300"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCsTarget(null);
                    setCsReplyText("");
                  }}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-black text-white"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={sendCsReply}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-700 px-4 py-4 font-black text-white"
                >
                  Kirim Balasan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
