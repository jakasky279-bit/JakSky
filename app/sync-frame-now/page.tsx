"use client";

import Link from "next/link";

export default function SyncFrameNowPage() {
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
        const u = findUser(comment.user);

        if (!u) return comment;

        return {
          ...comment,
          user: u.username || u.email || comment.user,
          title: u.title || comment.title || "Member JakSky",
          isVip: Boolean(u.isVip),
          avatar: u.avatar || comment.avatar || "",
          bio: u.bio || comment.bio || "",
          profileBg: u.profileBg || comment.profileBg || "purpleLightning",
          profileFrame: u.profileFrame || "none",
        };
      }),
    }));

    localStorage.setItem("jasky_contents", JSON.stringify(fixed));
    alert("Frame komentar sudah disinkronkan.");
  }

  return (
    <main className="min-h-screen p-5">
      <div className="jasky-card mx-auto max-w-md p-6 text-center">
        <p className="text-5xl">💎</p>
        <h1 className="mt-4 text-3xl font-black">Sync Frame Komentar</h1>
        <p className="mt-3 text-pink-100/70">
          Setelah pilih bingkai di profil, pencet tombol ini sekali agar komentar lama ikut berubah.
        </p>

        <button onClick={sync} className="jasky-button mt-5 w-full py-4">
          Sync Frame Sekarang
        </button>

        <Link href="/user" className="mt-3 block rounded-2xl bg-white/10 p-4 font-black">
          Ke User
        </Link>
      </div>
    </main>
  );
}
