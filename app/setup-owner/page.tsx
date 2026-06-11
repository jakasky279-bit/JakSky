"use client";

import { useState } from "react";

export default function SetupOwnerPage() {
  const [done, setDone] = useState(false);

  function setupOwner() {
    const owner = {
      id: "owner-main",
      username: "JakSky",
      email: "jasky@jasky.local",
      password: "JakSky231007",
      role: "owner",
      status: "active",
      accessKey: "JakSky",
      ownerKey: "JakSky",
      title: "Owner JakSky",
      isVip: true,
      avatar: "",
      bio: "",
    };

    const old = JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    const clean = old.filter((a: any) => String(a.role || "").toLowerCase() !== "owner");
    const next = [owner, ...clean];

    localStorage.setItem("jasky_accounts", JSON.stringify(next));
    localStorage.setItem("jasky_staff_session", JSON.stringify(owner));
    localStorage.setItem("jasky_current_user", JSON.stringify(owner));
    localStorage.setItem("jasky_login_user_id", owner.id);

    window.dispatchEvent(new Event("jasky-sync"));
    setDone(true);

    setTimeout(() => {
      window.location.href = "/owner";
    }, 900);
  }

  return (
    <main className="min-h-screen px-5 py-16 text-white">
      <div className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[34px] border border-pink-400/25 bg-black/65 p-7 text-center shadow-[0_25px_90px_rgba(0,0,0,.55)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-pink-500 via-purple-700 to-blue-500 text-4xl">
            ⚡
          </div>

          <h1 className="mt-6 text-4xl font-black">Setup Owner</h1>
          <p className="mt-3 text-white/60">
            Buat akun owner di browser/domain live ini.
          </p>

          <button
            type="button"
            onClick={setupOwner}
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-5 text-lg font-black text-white"
          >
            {done ? "Owner berhasil dibuat..." : "Buat Owner Sekarang"}
          </button>

          <p className="mt-5 text-sm text-white/45">
            Setelah berhasil, kamu otomatis masuk ke halaman owner.
          </p>
        </div>
      </div>
    </main>
  );
}
