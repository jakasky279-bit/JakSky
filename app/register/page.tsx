"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Account = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin" | "moderator" | "owner";
  status: "active" | "kicked" | "banned";
  title: string;
  isVip: boolean;
  createdAt: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vipKey, setVipKey] = useState("");
  const [error, setError] = useState("");

  function handleRegister() {
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Username, email, kata sandi, dan konfirmasi wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    if (password.length < 5) {
      setError("Kata sandi minimal 5 karakter.");
      return;
    }

    const accounts: Account[] = JSON.parse(
      localStorage.getItem("jasky_accounts") || "[]"
    );

    const exists = accounts.some(
      (acc) =>
        String(acc.username || "").trim().toLowerCase() === username.trim().toLowerCase() ||
        String(acc.email || "").trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      setError("Username atau email sudah terdaftar.");
      return;
    }

    const newUser: Account = {
      id: Date.now().toString(),
      username: username.trim(),
      email: email.trim(),
      password,
      role: "user",
      status: "active",
      title: "Member JakSky",
      isVip: vipKey.trim() !== "",
      createdAt: new Date().toLocaleString("id-ID"),
    };

    const updatedAccounts = [...accounts, newUser];

    localStorage.setItem("jasky_accounts", JSON.stringify(updatedAccounts));
    localStorage.setItem("jasky_current_user", JSON.stringify(newUser));
    localStorage.setItem("jasky_login_user_id", newUser.id);

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
            Buat Akun
          </h1>

          <p className="mt-2 text-pink-100/70">
            Daftar untuk mulai menikmati konten JakSky.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl p-4"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full rounded-2xl p-4"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="Konfirmasi kata sandi"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <input
            className="w-full rounded-2xl p-4"
            placeholder="VIP key, boleh kosong"
            value={vipKey}
            onChange={(e) => setVipKey(e.target.value)}
          />

          {error && (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/15 p-3 text-sm font-bold text-red-200">
              {error}
            </p>
          )}

          <button onClick={handleRegister} className="jasky-button w-full py-4">
            Daftar Sekarang
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-pink-100/70">
          Sudah punya akun?{" "}
          <Link href="/login/user" className="font-black text-pink-300">
            Masuk di sini
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
