"use client";

import Link from "next/link";
import { useState } from "react";

type Account = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "owner";
  status: "active";
  accessKey: string;
  ownerKey: string;
  title: string;
  isVip: boolean;
  avatar: string;
  bio: string;
};

const OWNER: Account = {
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

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function cleanLogin(value: string) {
  return value.trim().toLowerCase();
}

function cleanKey(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();
}

function cleanPassword(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").trim().toLowerCase();
}

function saveOwnerSession() {
  const accounts = getJSON<any[]>("jasky_accounts", []);
  const nonOwners = accounts.filter(
    (acc) => String(acc.role || "").toLowerCase() !== "owner"
  );

  localStorage.setItem("jasky_accounts", JSON.stringify([OWNER, ...nonOwners]));
  localStorage.setItem("jasky_staff_session", JSON.stringify(OWNER));
  localStorage.setItem("jasky_current_user", JSON.stringify(OWNER));
  localStorage.setItem("jasky_login_user_id", OWNER.id);
  window.dispatchEvent(new Event("jasky-sync"));
}

export default function OwnerLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ownerKey, setOwnerKey] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const u = cleanLogin(username);
    const p = cleanPassword(password);
    const k = cleanKey(ownerKey);

    const usernameOk = u === "jasky" || u === "jasky@jasky.local";
    const passwordOk = p === "jasky231007";
    const keyOk = k === "JAKSKY";

    if (!usernameOk || !passwordOk || !keyOk) {
      setError("Login owner gagal. Gunakan Username: JakSky, Password: JakSky231007, Owner Key: JakSky.");
      return;
    }

    saveOwnerSession();
    window.location.href = "/owner";
  }

  return (
    <main className="min-h-screen px-5 py-16 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
        <form
          onSubmit={submit}
          className="w-full rounded-[36px] border border-pink-400/25 bg-black/65 p-8 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 via-purple-700 to-blue-500 text-5xl shadow-[0_18px_50px_rgba(168,85,247,.45)]">
              ⚡
            </div>

            <h1 className="mt-7 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-5xl font-black text-transparent">
              Masuk Owner
            </h1>

            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-white/65">
              Akses khusus pemilik platform JakSky. Data login tidak ditampilkan untuk keamanan.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username atau email"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Kata sandi"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35"
            />

            <input
              value={ownerKey}
              onChange={(e) => setOwnerKey(e.target.value)}
              type="password"
              placeholder="Owner key"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-4 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-5 text-lg font-black text-white"
          >
            Masuk Sekarang
          </button>

          <Link href="/" className="mt-7 block text-center text-lg font-medium text-white/45">
            Kembali ke Beranda
          </Link>
        </form>
      </div>
    </main>
  );
}
