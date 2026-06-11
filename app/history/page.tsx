"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  title: string;
  description?: string;
  thumb?: string;
  category?: string;
  seconds?: number;
  duration?: number;
  updatedAt?: string;
};

function formatTime(seconds?: number) {
  const value = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(value / 60);
  const s = value % 60;

  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("jasky_watch_history") || "[]"));
    } catch {
      setItems([]);
    }
  }, []);

  function continueWatch(id: string) {
    localStorage.setItem("jasky_auto_open_content", id);
    window.location.href = "/user";
  }

  function clearHistory() {
    const ok = confirm("Hapus semua riwayat tontonan?");
    if (!ok) return;

    localStorage.removeItem("jasky_watch_history");
    setItems([]);
  }

  return (
    <main className="min-h-screen p-4 pb-24">
      <section className="mx-auto max-w-4xl">
        <div className="jasky-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="jasky-title text-4xl font-black">
                Riwayat Tontonan
              </h1>
              <p className="mt-2 text-pink-100/70">
                Lanjutkan video dari posisi terakhir kamu menonton.
              </p>
            </div>

            <Link href="/user" className="rounded-full bg-white/10 px-4 py-2 font-black">
              User
            </Link>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearHistory}
              className="mt-5 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-black text-red-200"
            >
              Hapus Riwayat
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4">
          {items.length === 0 ? (
            <div className="jasky-card p-8 text-center">
              <p className="text-5xl">🕘</p>
              <h2 className="mt-4 text-2xl font-black">Belum ada riwayat</h2>
              <p className="mt-2 text-pink-100/70">
                Video yang kamu buka akan muncul di sini.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="jasky-card overflow-hidden">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="aspect-video bg-black md:aspect-square">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        ▶
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="jasky-badge">{item.category || "Gratis"}</span>
                      <span className="jasky-badge">
                        Terakhir: {formatTime(item.seconds)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-black">{item.title}</h2>

                    <p className="mt-2 line-clamp-2 text-pink-100/65">
                      {item.description || "Belum ada deskripsi."}
                    </p>

                    <button
                      onClick={() => continueWatch(item.id)}
                      className="jasky-button mt-5 w-full py-4"
                    >
                      Lanjut Nonton
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
