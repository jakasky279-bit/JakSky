"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type CsReply = {
  id: string;
  from: string;
  text: string;
  createdAt: string;
};

type CsMessage = {
  id: string;
  user: string;
  userKey: string;
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

function safeDate(value?: string) {
  if (!value) return "Baru saja";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function getGuestId() {
  let id = localStorage.getItem("jasky_guest_id");

  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("jasky_guest_id", id);
  }

  return id;
}

function getUserIdentity() {
  const user = getJSON<any>("jasky_current_user", null);

  const userKey = String(user?.id || user?.email || user?.username || getGuestId())
    .trim()
    .toLowerCase();

  const name = user?.username || user?.email || "Guest JakSky";

  return { userKey, name };
}

export default function CustomerServiceWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<CsMessage[]>([]);

  const allowed = pathname === "/" || pathname === "/register" || pathname === "/login/user";

  function loadMessages() {
    if (!allowed) return;

    const identity = getUserIdentity();
    const all = getJSON<CsMessage[]>("jasky_cs_messages", []);
    setMessages(all.filter((msg) => msg.userKey === identity.userKey));
  }

  useEffect(() => {
    loadMessages();

    const sync = () => loadMessages();

    window.addEventListener("storage", sync);
    window.addEventListener("jasky-sync", sync);

    const timer = window.setInterval(sync, 1000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("jasky-sync", sync);
      window.clearInterval(timer);
    };
  }, [allowed, pathname]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return da - db;
    });
  }, [messages]);

  const hasNewReply = messages.some((msg) => (msg.replies || []).length > 0);

  function sendMessage(text?: string) {
    const value = String(text || input).trim();

    if (!value) {
      alert("Tulis pesan dulu bg.");
      return;
    }

    const identity = getUserIdentity();
    const all = getJSON<CsMessage[]>("jasky_cs_messages", []);

    const msg: CsMessage = {
      id: `cs-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user: identity.name,
      userKey: identity.userKey,
      text: value,
      createdAt: new Date().toISOString(),
      status: "baru",
      replies: [],
    };

    const next = [msg, ...all];

    localStorage.setItem("jasky_cs_messages", JSON.stringify(next));
    window.dispatchEvent(new Event("jasky-sync"));

    setInput("");
    loadMessages();
  }

  if (!allowed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-[999] flex h-[70px] w-[70px] items-center justify-center rounded-[28px] border border-pink-300/40 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 text-3xl shadow-[0_0_35px_rgba(236,72,153,.45),0_18px_65px_rgba(37,99,235,.35)] transition active:scale-95"
        aria-label="Customer Service"
      >
        <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full border-2 border-[#150714] bg-emerald-400" />
        {hasNewReply && (
          <span className="absolute -left-1 -top-1 h-5 w-5 animate-pulse rounded-full border-2 border-[#150714] bg-red-500" />
        )}
        🎧
      </button>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/75 px-4 pb-4 backdrop-blur-md sm:items-center sm:pb-0">
          <div className="w-full max-w-md overflow-hidden rounded-[34px] border border-pink-400/35 bg-[#100711] text-white shadow-[0_30px_120px_rgba(0,0,0,.75)]">
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-700 to-blue-700 p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-pink-300/20 blur-2xl" />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-xl font-black"
              >
                ×
              </button>

              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-4xl shadow-xl">
                  🎧
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/70">
                    JakSky Help
                  </p>
                  <h2 className="text-2xl font-black">Customer Service</h2>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-white/75">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Moderator siap membalas
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[56vh] space-y-3 overflow-y-auto p-4">
              <div className="max-w-[88%] rounded-3xl rounded-tl-md border border-white/10 bg-white/10 p-4 shadow-lg">
                <p className="font-black">Halo 👋</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Ada yang bisa Customer Service JakSky bantu? Pilih masalah cepat atau tulis pesan kamu.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["👤", "Masalah login"],
                  ["🔑", "VIP Key"],
                  ["🎬", "Video error"],
                  ["💬", "Lapor komentar"],
                ].map(([icon, item]) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item)}
                    className="rounded-2xl border border-pink-400/25 bg-pink-500/10 px-3 py-3 text-sm font-black text-pink-50 transition active:scale-95"
                  >
                    <span className="mr-2">{icon}</span>
                    {item}
                  </button>
                ))}
              </div>

              {sortedMessages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="ml-auto max-w-[88%] rounded-3xl rounded-tr-md bg-gradient-to-r from-pink-500 to-purple-700 p-4 shadow-lg">
                    <p className="whitespace-pre-wrap text-sm font-semibold">{msg.text}</p>
                    <p className="mt-2 text-[11px] font-semibold text-white/65">
                      {safeDate(msg.createdAt)} • {msg.status || "baru"}
                    </p>
                  </div>

                  {(msg.replies || []).map((reply) => (
                    <div
                      key={reply.id}
                      className="max-w-[88%] rounded-3xl rounded-tl-md border border-blue-400/25 bg-blue-500/15 p-4 shadow-lg"
                    >
                      <p className="text-xs font-black text-blue-100">{reply.from}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/85">
                        {reply.text}
                      </p>
                      <p className="mt-2 text-[11px] text-white/45">{safeDate(reply.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 bg-black/20 p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Tulis pesan ke CS..."
                  className="min-w-0 flex-1 rounded-2xl border border-pink-400/25 bg-black/35 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-pink-300"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 font-black text-white shadow-[0_14px_40px_rgba(217,70,239,.32)] active:scale-95"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
