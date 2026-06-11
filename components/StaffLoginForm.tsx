"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StaffRole = "JakSky" | "admin" | "moderator";

type Account = {
  id: string;
  username: string;
  email?: string;
  password?: string;
  role: string;
  status?: string;
  title?: string;
  isVip?: boolean;
  accessKey?: string;
  access_key?: string;
  ownerKey?: string;
  owner_key?: string;
};

type Props = {
  role: StaffRole;
  title: string;
  subtitle: string;
  redirectTo: string;
};

export default function StaffLoginForm({
  role,
  title,
  subtitle,
  redirectTo,
}: Props) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");

  function getAccounts(): Account[] {
    try {
      return JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    } catch {
      return [];
    }
  }

  function saveAccounts(accounts: Account[]) {
    localStorage.setItem("jasky_accounts", JSON.stringify(accounts));
  }

  function loginOwnerFallback() {
    const cleanUser = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanKey = accessKey.trim();

    if (
      role === "JakSky" &&
      cleanUser === "JakSky" &&
      cleanPassword === "JakSky231007" &&
      cleanKey === "JakSky"
    ) {
      const accounts = getAccounts();

      let owner = accounts.find((acc) => acc.role === "JakSky");

      if (!owner) {
        owner = {
          id: "owner-default",
          username: "JakSky",
          email: "jasky@jasky.local",
          password: "JakSky231007",
          role: "JakSky",
          status: "active",
          title: "Owner JakSky",
          isVip: true,
          accessKey: "JakSky",
          ownerKey: "JakSky",
        };

        saveAccounts([owner, ...accounts]);
      }

      localStorage.setItem("jasky_staff_session", JSON.stringify(owner));
      localStorage.setItem("jasky_current_user", JSON.stringify(owner));

      router.push(redirectTo);
      return true;
    }

    return false;
  }

  function handleLogin() {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan kata sandi wajib diisi.");
      return;
    }

    if (role === "JakSky" && !accessKey.trim()) {
      setError("Owner key wajib diisi.");
      return;
    }

    if (loginOwnerFallback()) return;

    const accounts = getAccounts();

    const cleanUser = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanKey = accessKey.trim();

    const account = accounts.find((acc) => {
      const sameUsername =
        String(acc.username || "").trim().toLowerCase() === cleanUser;

      const sameEmail =
        String(acc.email || "").trim().toLowerCase() === cleanUser;

      const accountKey =
        acc.accessKey || acc.access_key || acc.ownerKey || acc.owner_key || "";

      const roleMatch = String(acc.role || "").toLowerCase() === role;
      const passwordMatch = String(acc.password || "").trim() === cleanPassword;

      const keyMatch =
        !accountKey ||
        String(accountKey).trim() === cleanKey ||
        role !== "JakSky";

      return roleMatch && (sameUsername || sameEmail) && passwordMatch && keyMatch;
    });

    if (!account) {
      setError("Akun tidak ditemukan, kata sandi salah, atau key tidak cocok.");
      return;
    }

    if (account.status && account.status !== "active") {
      setError("Akun ini sedang tidak aktif.");
      return;
    }

    localStorage.setItem("jasky_staff_session", JSON.stringify(account));
    localStorage.setItem("jasky_current_user", JSON.stringify(account));

    router.push(redirectTo);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="jasky-card w-full max-w-md p-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 text-5xl shadow-2xl shadow-pink-500/30">
            ⚡
          </div>

          <h1 className="jasky-title mt-5 text-4xl font-black">{title}</h1>

          <p className="mt-2 text-pink-100/70">{subtitle}</p>
        </div>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl p-4"
            placeholder="Username atau email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full rounded-2xl p-4"
            placeholder="Kata sandi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="w-full rounded-2xl p-4"
            placeholder={role === "JakSky" ? "Owner key" : "Access key, kalau ada"}
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
          />

          {error && (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/15 p-3 text-sm font-bold text-red-200">
              {error}
            </p>
          )}

          <button onClick={handleLogin} className="jasky-button w-full py-4">
            Masuk Sekarang
          </button>
        </div>

        {role === "JakSky" && (
          <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-pink-100/70">
            <p className="font-black text-white">Data login owner disembunyikan untuk keamanan.</p>
</div>
        )}

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-bold text-pink-100/50"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
