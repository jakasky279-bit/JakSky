"use client";

import Link from "next/link";

const frames = ["none", "neon", "epic", "mythic", "fire", "ocean", "toxic", "royal"];

export default function ForceFramePage() {
  function setFrame(frame: string) {
    const accounts = JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    const current = JSON.parse(localStorage.getItem("jasky_current_user") || "null");
    const contents = JSON.parse(localStorage.getItem("jasky_contents") || "[]");

    if (!current) {
      alert("Belum login user.");
      return;
    }

    const updatedCurrent = {
      ...current,
      profileFrame: frame,
    };

    const keys = [
      updatedCurrent.id,
      updatedCurrent.username,
      updatedCurrent.email,
    ]
      .filter(Boolean)
      .map((x) => String(x).trim().toLowerCase());

    const fixedAccounts = accounts.map((acc: any) => {
      const accKeys = [acc.id, acc.username, acc.email]
        .filter(Boolean)
        .map((x) => String(x).trim().toLowerCase());

      const same = accKeys.some((x) => keys.includes(x));

      return same ? { ...acc, profileFrame: frame } : acc;
    });

    const fixedContents = contents.map((content: any) => ({
      ...content,
      comments: (content.comments || []).map((comment: any) => {
        const key = String(comment.user || "").trim().toLowerCase();

        if (!keys.includes(key)) return comment;

        return {
          ...comment,
          avatar: updatedCurrent.avatar || comment.avatar || "",
          title: updatedCurrent.title || comment.title || "Member JakSky",
          bio: updatedCurrent.bio || comment.bio || "",
          profileBg: updatedCurrent.profileBg || comment.profileBg || "purpleLightning",
          profileFrame: frame,
        };
      }),
    }));

    localStorage.setItem("jasky_current_user", JSON.stringify(updatedCurrent));
    localStorage.setItem("jasky_accounts", JSON.stringify(fixedAccounts));
    localStorage.setItem("jasky_contents", JSON.stringify(fixedContents));

    alert(`Frame diset ke: ${frame}`);
  }

  return (
    <main className="min-h-screen p-5">
      <div className="jasky-card mx-auto max-w-md p-6">
        <h1 className="text-3xl font-black">Force Frame Test</h1>
        <p className="mt-3 text-pink-100/70">
          Ini buat ngetes langsung frame komentar akun yang sedang login.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {frames.map((frame) => (
            <button
              key={frame}
              onClick={() => setFrame(frame)}
              className="rounded-2xl bg-white/10 p-4 font-black"
            >
              {frame}
            </button>
          ))}
        </div>

        <Link href="/user" className="jasky-button mt-5 block py-4 text-center">
          Ke User
        </Link>
      </div>
    </main>
  );
}
