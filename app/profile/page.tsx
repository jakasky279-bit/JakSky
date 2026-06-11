"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Account = {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: "user" | "admin" | "moderator" | "owner" | string;
  status?: "active" | "disabled" | string;
  title?: string;
  isVip?: boolean;
  avatar?: string;
  bio?: string;
  profileBg?: string;
  profileFrame?: string;
};

const BG_OPTIONS = [
  { id: "purpleLightning", name: "Purple Lightning", className: "from-fuchsia-600 via-violet-800 to-blue-700" },
  { id: "pinkGlitter", name: "Pink Glitter", className: "from-pink-600 via-rose-700 to-fuchsia-800" },
  { id: "cyberGrid", name: "Cyber Grid", className: "from-sky-900 via-cyan-900 to-blue-950" },
  { id: "neonWave", name: "Neon Wave", className: "from-purple-800 via-fuchsia-700 to-blue-700" },
];

const FRAME_OPTIONS = [
  { id: "none", name: "Tanpa Frame", style: {} },
  {
    id: "epic",
    name: "Epic Gold",
    style: {
      border: "4px solid #fbbf24",
      boxShadow: "0 0 20px rgba(251,191,36,.75), 0 0 45px rgba(251,191,36,.35)",
      padding: "3px",
    },
  },
  {
    id: "neon",
    name: "Neon ML",
    style: {
      border: "4px solid #ff3df2",
      boxShadow: "0 0 20px rgba(255,61,242,.75), 0 0 45px rgba(59,130,246,.45)",
      padding: "3px",
    },
  },
  {
    id: "royal",
    name: "Royal Star",
    style: {
      border: "4px solid #a855f7",
      boxShadow: "0 0 20px rgba(168,85,247,.75), 0 0 45px rgba(14,165,233,.35)",
      padding: "3px",
    },
  },
  {
    id: "toxic",
    name: "Toxic Green",
    style: {
      border: "4px solid #22c55e",
      boxShadow: "0 0 20px rgba(34,197,94,.75), 0 0 45px rgba(20,184,166,.35)",
      padding: "3px",
    },
  },
];

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function accountKey(acc?: Account | null) {
  return String(acc?.id || acc?.email || acc?.username || "guest").trim().toLowerCase();
}

function findCurrentUser(accounts: Account[]) {
  const current = getJSON<Account | null>("jasky_current_user", null);
  const loginId = localStorage.getItem("jasky_login_user_id");

  const keys = [
    current?.id,
    current?.email,
    current?.username,
    loginId,
  ]
    .filter(Boolean)
    .map((x) => String(x).trim().toLowerCase());

  return (
    accounts.find((acc) => {
      const values = [acc.id, acc.email, acc.username]
        .filter(Boolean)
        .map((x) => String(x).trim().toLowerCase());

      return values.some((v) => keys.includes(v));
    }) ||
    current ||
    null
  );
}

function bgClass(profileBg?: string) {
  return BG_OPTIONS.find((bg) => bg.id === profileBg)?.className || BG_OPTIONS[0].className;
}

function frameStyle(profileFrame?: string) {
  return FRAME_OPTIONS.find((f) => f.id === profileFrame)?.style || {};
}

export default function ProfilePage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [user, setUser] = useState<Account | null>(null);
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [profileBg, setProfileBg] = useState("purpleLightning");
  const [profileFrame, setProfileFrame] = useState("none");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState("");

  const isStaff = user?.role === "admin" || user?.role === "moderator" || user?.role === "owner";
  const displayName = user?.username || user?.email || "User JakSky";
  const displayTitle = isStaff
    ? user?.role === "owner"
      ? "Owner JakSky"
      : user?.role === "admin"
      ? "Admin JakSky"
      : "Moderator JakSky"
    : user?.title || "Member JakSky";

  const accessText = isStaff ? "Staff" : user?.isVip ? "VIP" : "Free";
  const roleText = user?.role || "user";

  const headerClass = useMemo(() => bgClass(profileBg), [profileBg]);

  useEffect(() => {
    const savedAccounts = getJSON<Account[]>("jasky_accounts", []);
    const found = findCurrentUser(savedAccounts);

    if (!found) {
      router.replace("/");
      return;
    }

    setAccounts(savedAccounts);
    setUser(found);
    setAvatar(found.avatar || "");
    setBio(found.bio || "");
    setProfileBg(found.profileBg || "purpleLightning");
    setProfileFrame(found.profileFrame || "none");
  }, [router]);

  function pickAvatar(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    if (!user) return;

    if (newPassword.trim()) {
      if (!oldPassword.trim()) {
        setNotice("⚠️ Isi password lama dulu.");
        return;
      }

      if (user.password && oldPassword !== user.password) {
        setNotice("⚠️ Password lama salah.");
        return;
      }
    }

    const updatedUser: Account = {
      ...user,
      avatar,
      bio,
      profileBg,
      profileFrame,
      password: newPassword.trim() ? newPassword.trim() : user.password,
    };

    let foundAccount = false;

    const updatedAccounts = accounts.map((acc) => {
      const same =
        (updatedUser.id && acc.id === updatedUser.id) ||
        (updatedUser.email && acc.email === updatedUser.email) ||
        (updatedUser.username && acc.username === updatedUser.username);

      if (!same) return acc;

      foundAccount = true;
      return { ...acc, ...updatedUser };
    });

    const finalAccounts = foundAccount ? updatedAccounts : [...updatedAccounts, updatedUser];

    const frameMap = getJSON<Record<string, string>>("jasky_profile_frames", {});
    const keys = [updatedUser.id, updatedUser.email, updatedUser.username].filter(Boolean);

    keys.forEach((key) => {
      frameMap[String(key).trim().toLowerCase()] = profileFrame || "none";
    });

    localStorage.setItem("jasky_accounts", JSON.stringify(finalAccounts));
    localStorage.setItem("jasky_current_user", JSON.stringify(updatedUser));
    localStorage.setItem("jasky_login_user_id", String(updatedUser.id || updatedUser.email || updatedUser.username || ""));
    localStorage.setItem("jasky_profile_frames", JSON.stringify(frameMap));

    setAccounts(finalAccounts);
    setUser(updatedUser);
    setOldPassword("");
    setNewPassword("");
    setNotice("✅ Profil berhasil disimpan.");

    try {
      window.dispatchEvent(new Event("jasky-sync"));
    } catch {}
  }

  function logout() {
    const ok = confirm("Keluar dari akun ini?");
    if (!ok) return;

    localStorage.removeItem("jasky_current_user");
    localStorage.removeItem("jasky_login_user_id");
    localStorage.removeItem("jasky_staff_session");

    window.location.href = "/";
  }

  if (!user) {
    return (
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto mt-20 max-w-md rounded-[28px] border border-white/10 bg-black/40 p-6 text-center">
          Memuat profil...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15"
          >
            ← Kembali
          </button>

          <h1 className="text-xl font-black sm:text-2xl">Kustomisasi Profil</h1>
        </div>

        {notice && (
          <div className="mb-4 rounded-2xl border border-cyan-300/30 bg-cyan-500/20 px-4 py-3 font-bold text-cyan-50">
            {notice}
          </div>
        )}

        <section className="overflow-hidden rounded-[34px] border border-pink-400/25 bg-black/50 shadow-[0_20px_80px_rgba(0,0,0,.45)]">
          <div className={`relative min-h-[330px] bg-gradient-to-br ${headerClass} px-5 py-8 text-center`}>
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <span className="absolute left-[16%] top-[30%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
              <span className="absolute right-[22%] top-[22%] h-1.5 w-1.5 animate-ping rounded-full bg-pink-300" />
              <span className="absolute bottom-[25%] right-[12%] h-1.5 w-1.5 animate-pulse rounded-full bg-blue-200" />
            </div>

            <button
              type="button"
              onClick={() => alert("Ini pratinjau profil kamu. Simpan dulu agar muncul di komentar.")}
              className="absolute right-5 top-5 rounded-2xl bg-black/35 px-4 py-3 font-bold text-white backdrop-blur"
            >
              👁 Pratinjau
            </button>

            <div className="relative mx-auto mt-10 flex w-fit flex-col items-center">
              <div
                className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[30px] bg-gradient-to-br from-pink-500 to-purple-700 text-5xl shadow-2xl"
                style={frameStyle(profileFrame)}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="h-full w-full rounded-[24px] object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <label className="mt-4 cursor-pointer rounded-2xl bg-black/45 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-black/60">
                ✏️ Ubah Avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickAvatar(e.target.files?.[0])}
                />
              </label>
            </div>

            <h2 className="mt-7 break-words text-3xl font-black sm:text-4xl">{displayName}</h2>
            <p className="mt-2 text-lg font-semibold text-white/70">
              {isStaff ? "Private Account" : "Public Profile"}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-pink-300/30 bg-pink-500/20 px-4 py-2 text-sm font-black">
                {displayTitle}
              </span>
              <span className="rounded-full border border-pink-300/30 bg-pink-500/20 px-4 py-2 text-sm font-black">
                {isStaff ? "Private Account" : user.isVip ? "User VIP" : "User Gratis"}
              </span>
              <span className="rounded-full border border-pink-300/30 bg-pink-500/20 px-4 py-2 text-sm font-black">
                Status: {user.status || "active"}
              </span>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-[28px] border border-pink-400/25 bg-white/5 p-5">
              <h3 className="text-sm font-black tracking-[0.3em] text-pink-200">BIO</h3>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tulis bio kamu..."
                className="mt-4 min-h-32 w-full rounded-2xl border border-pink-400/25 bg-black/25 p-4 text-white outline-none placeholder:text-white/35 focus:border-pink-300"
              />
            </div>

            <div className="rounded-[28px] border border-pink-400/25 bg-white/5 p-5">
              <h3 className="text-2xl font-black">✨ Pilih Background Profil</h3>
              <p className="mt-2 text-sm font-medium text-white/55">
                Background muncul di header profil dan efeknya kelap-kelip.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {BG_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setProfileBg(bg.id)}
                    className={[
                      "rounded-2xl border p-3 text-left transition",
                      profileBg === bg.id ? "border-pink-300 bg-pink-500/20" : "border-white/10 bg-black/20",
                    ].join(" ")}
                  >
                    <div className={`h-24 rounded-xl bg-gradient-to-br ${bg.className}`} />
                    <p className="mt-3 font-black">{bg.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-pink-400/25 bg-white/5 p-5">
              <h3 className="text-2xl font-black">💎 Frame Pinggir Foto</h3>
              <p className="mt-2 text-sm font-medium text-white/55">
                Pilih “Tanpa Frame” kalau mau foto biasa. Frame hanya muncul kalau dipilih.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {FRAME_OPTIONS.map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setProfileFrame(frame.id)}
                    className={[
                      "rounded-2xl border p-4 text-center transition",
                      profileFrame === frame.id ? "border-pink-300 bg-pink-500/20" : "border-white/10 bg-black/20",
                    ].join(" ")}
                  >
                    <div
                      className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 text-3xl"
                      style={frame.style}
                    >
                      {avatar ? <img src={avatar} alt="" className="h-full w-full rounded-xl object-cover" /> : "👤"}
                    </div>
                    <p className="mt-3 font-black">{frame.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-pink-400/25 bg-white/5 p-5">
              <h3 className="text-2xl font-black">🔑 Ubah Password</h3>
              <p className="mt-2 text-sm font-medium text-white/55">
                Kosongkan kalau tidak ingin mengganti password.
              </p>

              <div className="mt-5 grid gap-3">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Password lama"
                  className="rounded-2xl border border-pink-400/25 bg-black/25 p-4 text-white outline-none placeholder:text-white/35 focus:border-pink-300"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="rounded-2xl border border-pink-400/25 bg-black/25 p-4 text-white outline-none placeholder:text-white/35 focus:border-pink-300"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-5 text-lg font-black text-white shadow-[0_18px_55px_rgba(217,70,239,.25)] transition hover:scale-[1.01]"
            >
              💾 Simpan Profil
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-red-400/20 bg-black/45 p-5 shadow-[0_18px_50px_rgba(0,0,0,.3)]">
          <h2 className="text-2xl font-black">Akun</h2>
          <p className="mt-2 text-sm font-medium text-white/55">
            Keluar dari akun kamu dengan aman. Setelah logout, kamu akan kembali ke halaman awal.
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-5 w-full rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-500 to-rose-700 px-5 py-5 text-lg font-black text-white shadow-[0_14px_35px_rgba(244,63,94,.25)] transition hover:scale-[1.01]"
          >
            Keluar Akun
          </button>
        </section>
      </div>
    </main>
  );
}
