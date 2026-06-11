"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Account = {
  id: string;
  username: string;
  email?: string;
  password: string;
  role: "user" | "admin" | "moderator" | "owner";
  status: "active" | "kicked" | "banned";
  title?: string;
  isVip?: boolean;
  createdAt?: string;
};

export default function UserLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    setError("");

    const accounts: Account[] = JSON.parse(
      localStorage.getItem("jasky_accounts") || "[]"
    );

    const cleanLogin = login.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = accounts.find((acc) => {
      const sameUsername =
        String(acc.username || "").trim().toLowerCase() === cleanLogin;

      const sameEmail =
        String(acc.email || "").trim().toLowerCase() === cleanLogin;

      return (
        acc.role === "user" &&
        (sameUsername || sameEmail) &&
        String(acc.password || "").trim() === cleanPassword
      );
    });

    if (!user) {
      setError("Akun tidak ditemukan atau kata sandi salah.");
      return;
    }

    if (user.status !== "active") {
      setError("Akun kamu sedang tidak aktif.");
      return;
    }

    localStorage.setItem("jasky_current_user", JSON.stringify(user));
    localStorage.setItem("jasky_login_user_id", user.id);

    router.push("/user");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="jasky-card w-full max-w-md p-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 text-5xl shadow-2xl shadow-pink-500/30">
            ⚡
          </div>

          <h1 className="jasky-title mt-5 text-4xl font-black">
            Masuk User
          </h1>

          <p className="mt-2 text-pink-100/70">
            Masuk untuk menikmati konten gratis dan VIP.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl p-4"
            placeholder="Username atau email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <input
            className="w-full rounded-2xl p-4"
            placeholder="Kata sandi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <p className="mt-5 text-center text-sm text-pink-100/70">
          Belum punya akun?{" "}
          <Link href="/register" className="font-black text-pink-300">
            Daftar di sini
          </Link>
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-bold text-pink-100/50"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
