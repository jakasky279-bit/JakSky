"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Account = {
  id: string;
  username: string;
  password: string;
  accessKey?: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "kicked" | "banned";
  title: string;
  isVip: boolean;
  createdAt: string;
};

export default function OwnerDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [websiteTitle, setWebsiteTitle] = useState("JakSky");
  const [userTitle, setUserTitle] = useState("JakSky User Area");
  const [adminTitle, setAdminTitle] = useState("JakSky Admin Panel");
  const [moderatorTitle, setModeratorTitle] = useState("JakSky Moderator Panel");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("admin");
  const [accessKey, setAccessKey] = useState("");

  useEffect(() => {
    const savedAccounts = localStorage.getItem("jasky_accounts");
    const savedSettings = localStorage.getItem("jasky_settings");

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }

    if (savedSettings) {
      const s = JSON.parse(savedSettings);
      setWebsiteTitle(s.websiteTitle || "JakSky");
      setUserTitle(s.userTitle || "JakSky User Area");
      setAdminTitle(s.adminTitle || "JakSky Admin Panel");
      setModeratorTitle(s.moderatorTitle || "JakSky Moderator Panel");
    }
  }, []);

  function saveAccounts(updatedAccounts: Account[]) {
    setAccounts(updatedAccounts);
    localStorage.setItem("jasky_accounts", JSON.stringify(updatedAccounts));
  }

  function saveTitle() {
    localStorage.setItem(
      "jasky_settings",
      JSON.stringify({
        websiteTitle,
        userTitle,
        adminTitle,
        moderatorTitle,
      })
    );

    alert("Title berhasil disimpan.");
  }

  function createAccount() {
    if (!username || !password || !accessKey) {
      alert("Username, password, dan access key wajib diisi.");
      return;
    }

    const alreadyExists = accounts.some(
      (acc) => String(acc.username || "").trim().toLowerCase() === username.trim().toLowerCase()
    );

    if (alreadyExists) {
      alert("Username sudah ada.");
      return;
    }

    const newAccount: Account = {
      id: Date.now().toString(),
      username,
      password,
      accessKey,
      role,
      status: "active",
      title: role === "admin" ? "Admin JakSky" : "Moderator JakSky",
      isVip: false,
      createdAt: new Date().toLocaleString("id-ID"),
    };

    saveAccounts([...accounts, newAccount]);

    setUsername("");
    setPassword("");
    setAccessKey("");
    setRole("admin");

    alert("Akun berhasil dibuat dan tersimpan.");
  }

  function changeTitle(id: string, title: string) {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, title } : acc
    );

    saveAccounts(updated);
  }

  function kickAccount(id: string) {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, status: "kicked" as const } : acc
    );

    saveAccounts(updated);
  }

  function activateAccount(id: string) {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, status: "active" as const } : acc
    );

    saveAccounts(updated);
  }

  function deleteAccount(id: string) {
    const ok = confirm("Yakin mau hapus akun ini?");
    if (!ok) return;

    const updated = accounts.filter((acc) => acc.id !== id);
    saveAccounts(updated);
  }

  function resetAllAccounts() {
    const ok = confirm("Hapus semua akun tersimpan? Ini untuk bersihin data dummy lama.");
    if (!ok) return;

    localStorage.removeItem("jasky_accounts");
    setAccounts([]);
    alert("Semua akun sudah dibersihkan.");
  }

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <section className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black">Owner Dashboard</h1>
            <p className="text-zinc-400 mt-1">Kelola akun, role, title, VIP, dan pengaturan utama platform.</p>
          </div>

          <Link href="/" className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            Keluar
          </Link>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
            <h2 className="text-xl font-black">Set Title Halaman</h2>

            <div className="space-y-3 mt-4">
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={websiteTitle} onChange={(e) => setWebsiteTitle(e.target.value)} placeholder="Title Website" />
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={userTitle} onChange={(e) => setUserTitle(e.target.value)} placeholder="Title User" />
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} placeholder="Title Admin" />
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={moderatorTitle} onChange={(e) => setModeratorTitle(e.target.value)} placeholder="Title Moderator" />

              <button onClick={saveTitle} className="w-full bg-white text-black rounded-2xl py-4 font-black">
                Simpan Title
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
            <h2 className="text-xl font-black">Buat Akun Admin / Moderator</h2>

            <div className="space-y-3 mt-4">
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

              <select className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={role} onChange={(e) => setRole(e.target.value as "admin" | "moderator")}>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>

              <input className="w-full bg-black border border-zinc-700 rounded-2xl p-4" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Access Key" />

              <button onClick={createAccount} className="w-full bg-white text-black rounded-2xl py-4 font-black">
                Buat Akun
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 mt-5">
          <div className="flex justify-between items-center gap-3">
            <div>
              <h2 className="text-xl font-black">Daftar Akun Terdaftar</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Akun baru dari registrasi user atau buatan owner akan muncul di sini.
              </p>
            </div>

            <button onClick={resetAllAccounts} className="bg-red-600 px-3 py-2 rounded-xl text-sm font-bold">
              Bersihkan
            </button>
          </div>

          <div className="space-y-4 mt-5">
            {accounts.length === 0 ? (
              <div className="bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-400">
                Belum ada akun. Coba buat admin/moderator atau daftar user baru.
              </div>
            ) : (
              accounts.map((acc) => (
                <div key={acc.id} className="bg-black border border-zinc-800 rounded-3xl p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{acc.username}</h3>
                      <p className="text-sm text-zinc-400">
                        Role: {acc.role} • Status: {acc.status} • {acc.isVip ? "VIP" : "Gratis"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Dibuat: {acc.createdAt}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs">
                      {acc.title}
                    </span>
                  </div>

                  <input
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-3 mt-4"
                    value={acc.title}
                    onChange={(e) => changeTitle(acc.id, e.target.value)}
                    placeholder="Set title akun"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {acc.status === "active" ? (
                      <button onClick={() => kickAccount(acc.id)} className="bg-yellow-500 text-black rounded-xl py-2 font-bold">
                        Kick
                      </button>
                    ) : (
                      <button onClick={() => activateAccount(acc.id)} className="bg-green-500 text-black rounded-xl py-2 font-bold">
                        Aktifkan
                      </button>
                    )}

                    <button onClick={() => deleteAccount(acc.id)} className="bg-red-600 rounded-xl py-2 font-bold">
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
