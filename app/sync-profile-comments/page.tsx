"use client";

import Link from "next/link";

export default function SyncProfileCommentsPage() {
  function sync() {
    const accounts = JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    const current = JSON.parse(localStorage.getItem("jasky_current_user") || "null");
    const staff = JSON.parse(localStorage.getItem("jasky_staff_session") || "null");
    const contents = JSON.parse(localStorage.getItem("jasky_contents") || "[]");

    const users = [...accounts, current, staff].filter(Boolean);

    const findUser = (name: string) => {
      const key = String(name || "").trim().toLowerCase();

      return users.find((acc: any) => {
        return (
          String(acc.id || "").trim().toLowerCase() === key ||
          String(acc.username || "").trim().toLowerCase() === key ||
          String(acc.email || "").trim().toLowerCase() === key
        );
      });
    };

    const fixed = contents.map((content: any) => ({
      ...content,
      comments: (content.comments || []).map((comment: any) => {
        const user = findUser(comment.user);

        if (!user) return comment;

        return {
          ...comment,
          user: user.username || user.email || comment.user,
          title: user.title || comment.title || "Member JakSky",
          isVip: Boolean(user.isVip),
          avatar: user.avatar || comment.avatar || "",
          bio: user.bio || comment.bio || "",
          profileBg: user.profileBg || comment.profileBg || "purpleLightning",
          profileFrame: user.profileFrame || "none",
        };
      }),
    }));

    localStorage.setItem("jasky_contents", JSON.stringify(fixed));
    alert("Komentar sudah disinkronkan dengan profil terbaru.");
  }

  return (
    <main className="min-h-screen p-5">
      <div className="jasky-card mx-auto max-w-md p-6 text-center">
        <p className="text-5xl">🔄</p>
        <h1 className="mt-4 text-3xl font-black">Sync Profil Komentar</h1>
        <p className="mt-3 text-pink-100/70">
          Pakai ini kalau frame/avatar yang sudah dipilih belum muncul di komentar lama.
        </p>

        <button onClick={sync} className="jasky-button mt-5 w-full py-4">
          Sync Sekarang
        </button>

        <Link href="/user" className="mt-3 block rounded-2xl bg-white/10 p-4 font-black">
          Ke User
        </Link>
      </div>
    </main>
  );
}
