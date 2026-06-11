"use client";

import { useEffect, useMemo, useState } from "react";

type Account = {
  id?: string;
  username?: string;
  email?: string;
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

const quickIssues = [
  "Masalah login",
  "VIP Key",
  "Video error",
  "Lapor komentar",
];

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `cs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeTime(value?: string) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "Baru saja";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function CustomerServiceWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<CsMessage[]>([]);

  function loadMessages() {
    setMessages(getJSON<CsMessage[]>("jasky_cs_messages", []));
  }

  useEffect(() => {
    loadMessages();

    const sync = () => loadMessages();
    window.addEventListener("storage", sync);
    window.addEventListener("jasky-sync", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jasky-sync", sync);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const currentUser = useMemo(() => {
    return getJSON<Account | null>("jasky_current_user", null);
  }, [open]);

  const userName =
    currentUser?.username ||
    currentUser?.email ||
    "Guest JakSky";

  const userKey =
    currentUser?.id ||
    currentUser?.username ||
    currentUser?.email ||
    "guest";

  const myMessages = messages
    .filter((msg) => String(msg.userKey || msg.user) === String(userKey))
    .slice(-3);

  function saveMessage(messageText: string) {
    const clean = messageText.trim();
    if (!clean) return;

    const next: CsMessage[] = [
      ...getJSON<CsMessage[]>("jasky_cs_messages", []),
      {
        id: makeId(),
        user: userName,
        userKey,
        text: clean,
        createdAt: new Date().toISOString(),
        status: "baru",
        replies: [],
      },
    ];

    localStorage.setItem("jasky_cs_messages", JSON.stringify(next));
    window.dispatchEvent(new Event("jasky-sync"));
    setMessages(next);
    setText("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-[99990] flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-pink-500 via-purple-700 to-blue-600 text-3xl shadow-[0_18px_50px_rgba(236,72,153,.45)]"
        aria-label="Buka Customer Service"
      >
        🎧
      </button>

      {open && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 px-4 pb-7 backdrop-blur-md">
          <button
            type="button"
            aria-label="Tutup Customer Service"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <section className="relative z-[100000] w-full max-w-xl overflow-hidden rounded-[32px] border border-pink-300/30 bg-[#130713] text-white shadow-[0_30px_100px_rgba(0,0,0,.7)]">
            <div className="relative bg-gradient-to-r from-pink-500 via-purple-700 to-blue-600 p-5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="absolute right-4 top-4 z-[100001] flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-3xl font-light text-white shadow-lg active:scale-95"
                aria-label="Tutup"
              >
                ×
              </button>

              <div className="flex items-center gap-4 pr-14">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-4xl shadow-xl">
                  🎧
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/75">
                    JakSky Help
                  </p>
                  <h2 className="text-3xl font-black leading-tight">
                    Customer Service
                  </h2>
                  <p className="mt-1 text-sm font-bold text-white/80">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-400" />
                    Moderator siap membalas
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-5">
                <h3 className="text-xl font-black">Halo 👋</h3>
                <p className="mt-2 text-white/65">
                  Ada yang bisa Customer Service JakSky bantu? Pilih masalah cepat atau tulis pesan kamu.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickIssues.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => saveMessage(item)}
                    className="rounded-2xl border border-pink-400/30 bg-pink-500/10 px-3 py-4 text-base font-bold text-white active:scale-[.98]"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {myMessages.length > 0 && (
                <div className="max-h-44 space-y-3 overflow-y-auto pr-1">
                  {myMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-[22px] bg-gradient-to-r from-pink-500 to-purple-700 p-4 shadow-lg"
                    >
                      <p className="font-black">{msg.text}</p>
                      <p className="mt-2 text-xs font-bold text-white/75">
                        {safeTime(msg.createdAt)} • {msg.status || "baru"}
                      </p>

                      {(msg.replies || []).map((reply) => (
                        <div key={reply.id} className="mt-3 rounded-2xl bg-black/25 p-3">
                          <p className="text-xs font-black text-white/70">{reply.from}</p>
                          <p className="mt-1 text-sm">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 border-t border-white/10 pt-4">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveMessage(text);
                  }}
                  placeholder="Tulis pesan ke CS..."
                  className="min-w-0 flex-1 rounded-2xl border border-pink-400/30 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
                />

                <button
                  type="button"
                  onClick={() => saveMessage(text)}
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-4 font-black text-white shadow-lg active:scale-95"
                >
                  Kirim
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
