"use client";

import Link from "next/link";

const frames = ["none", "neon", "epic", "mythic", "fire", "ocean", "toxic", "royal"];

export default function ApplyFramePage() {
  function apply(frame: string, all = false) {
    const current = JSON.parse(localStorage.getItem("jasky_current_user") || "null");
    const accounts = JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    const contents = JSON.parse(localStorage.getItem("jasky_contents") || "[]");

    if (!current && !all) {
      alert("Belum login.");
      return;
    }

    const keys = current
      ? [current.id, current.username, current.email]
          .filter(Boolean)
          .map((x: any) => String(x).trim().toLowerCase())
      : [];

    const fixedCurrent = current ? { ...current, profileFrame: frame } : current;

    const fixedAccounts = accounts.map((acc: any) => {
      const accKeys = [acc.id, acc.username, acc.email]
        .filter(Boolean)
        .map((x: any) => String(x).trim().toLowerCase());

      const same = all || accKeys.some((x: string) => keys.includes(x));

      return same ? { ...acc, profileFrame: frame } : acc;
    });

    const fixedContents = contents.map((content: any) => ({
      ...content,
      comments: (content.comments || []).map((comment: any) => {
        const commentKey = String(comment.user || "").trim().toLowerCase();
        const same = all || keys.includes(commentKey);

        return same
          ? {
              ...comment,
              profileFrame: frame,
              avatar: current?.avatar || comment.avatar || "",
              title: current?.title || comment.title || "Member JakSky",
              profileBg: current?.profileBg || comment.profileBg || "purpleLightning",
            }
          : comment;
      }),
    }));

    if (fixedCurrent) {
      localStorage.setItem("jasky_current_user", JSON.stringify(fixedCurrent));
    }

    localStorage.setItem("jasky_accounts", JSON.stringify(fixedAccounts));
    localStorage.setItem("jasky_contents", JSON.stringify(fixedContents));

    alert(all ? `Frame ${frame} diterapkan ke semua komentar.` : `Frame ${frame} diterapkan ke komentar akun ini.`);
  }

  return (
    <main className="min-h-screen p-5">
      <div className="jasky-card mx-auto max-w-md p-6">
        <h1 className="text-3xl font-black">Terapkan Frame Komentar</h1>
        <p className="mt-3 text-pink-100/70">
          Pakai ini kalau frame di profil belum muncul di komentar lama.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {frames.map((frame) => (
            <button
              key={frame}
              onClick={() => apply(frame)}
              className="rounded-2xl bg-white/10 p-4 font-black"
            >
              Akun: {frame}
            </button>
          ))}
        </div>

        <button
          onClick={() => apply("mythic", true)}
          className="mt-5 w-full rounded-2xl bg-yellow-500/20 p-4 font-black text-yellow-100"
        >
          Test Paksa Semua Komentar: Mythic
        </button>

        <button
          onClick={() => apply("none", true)}
          className="mt-3 w-full rounded-2xl bg-white/10 p-4 font-black"
        >
          Reset Semua Frame
        </button>

        <Link href="/user" className="jasky-button mt-5 block py-4 text-center">
          Ke User
        </Link>
      </div>
    </main>
  );
}
