"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Account = {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  accessKey?: string;
  ownerKey?: string;
  title?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
};

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveOwnerSession(owner: Account) {
  localStorage.setItem("jasky_staff_session", JSON.stringify(owner));
  localStorage.setItem("jasky_current_user", JSON.stringify(owner));
  localStorage.setItem("jasky_login_user_id", owner.id || "owner-main");
  window.dispatchEvent(new Event("jasky-sync"));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function OwnerLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [ownerKey, setOwnerKey] = useState("");
  const [error, setError] = useState("");

  function createDefaultOwner(): Account {
    return {
      id: "owner-main",
      username: "owner",
      email: "owner@jasky.local",
      password: "jasky123",
      role: "owner",
      status: "active",
      accessKey: "JAKSKY-OWNER",
      ownerKey: "JAKSKY-OWNER",
      title: "Owner JakSky",
      isVip: true,
      avatar: "",
      bio: "",
    };
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const inputLogin = normalize(login);
    const inputPassword = password.trim();
    const inputKey = ownerKey.trim();

    const accounts = getJSON<Account[]>("jasky_accounts", []);
    const defaultOwner = createDefaultOwner();

    const found = accounts.find((acc) => {
      const role = normalize(String(acc.role || ""));
      const status = normalize(String(acc.status || "active"));

      const sameLogin =
        normalize(String(acc.username || "")) === inputLogin ||
        normalize(String(acc.email || "")) === inputLogin;

      const samePassword = String(acc.password || "") === inputPassword;
      const sameKey = String(acc.accessKey || acc.ownerKey || "") === inputKey;

      return role === "owner" && status !== "disabled" && sameLogin && samePassword && sameKey;
    });

    if (found) {
      saveOwnerSession(found);
      router.push("/owner");
      return;
    }

    const defaultLoginOk =
      (inputLogin === "owner" || inputLogin === "owner@jasky.local") &&
      inputPassword === "jasky123" &&
      inputKey === "JAKSKY-OWNER";

    if (defaultLoginOk) {
      const clean = accounts.filter((acc) => normalize(String(acc.role || "")) !== "owner");
      const next = [defaultOwner, ...clean];

      localStorage.setItem("jasky_accounts", JSON.stringify(next));
      saveOwnerSession(defaultOwner);
      router.push("/owner");
      return;
    }

    setError("Login owner gagal. Periksa username, password, dan owner key.");
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
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Username atau email"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35 focus:border-pink-300"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Kata sandi"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35 focus:border-pink-300"
            />

            <input
              value={ownerKey}
              onChange={(e) => setOwnerKey(e.target.value)}
              type="password"
              placeholder="Owner key"
              className="w-full rounded-2xl border border-pink-400/35 bg-white/10 px-5 py-5 text-lg text-white outline-none placeholder:text-white/35 focus:border-pink-300"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-4 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-5 text-lg font-black text-white shadow-[0_18px_45px_rgba(236,72,153,.35)] active:scale-[.99]"
          >
            Masuk Sekarang
          </button>

          <Link
            href="/"
            className="mt-7 block text-center text-lg font-medium text-white/45 hover:text-white"
          >
            Kembali ke Beranda
          </Link>
        </form>
      </div>
    </main>
  );
}
