"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  title?: string;
};

const publicLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
  { href: "/help", label: "Bantuan" },
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Ketentuan" },
];

export default function JakSkyNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);

  function readSession() {
    try {
      const staff = JSON.parse(localStorage.getItem("jasky_staff_session") || "null");
      const user = JSON.parse(localStorage.getItem("jasky_current_user") || "null");

      setSession(staff || user || null);
    } catch {
      setSession(null);
    }
  }

  useEffect(() => {
    readSession();

    window.addEventListener("focus", readSession);
    window.addEventListener("storage", readSession);

    return () => {
      window.removeEventListener("focus", readSession);
      window.removeEventListener("storage", readSession);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function logout() {
    localStorage.removeItem("jasky_current_user");
    localStorage.removeItem("jasky_login_user_id");
    localStorage.removeItem("jasky_staff_session");

    setSession(null);
    setOpen(false);

    window.jaskyToast?.("Berhasil keluar dari akun.", "success");

    router.push("/");
  }

  const role = String(session?.role || "user").toLowerCase();
  const dashboardHref =
    role === "owner"
      ? "/owner"
      : role === "admin"
      ? "/admin"
      : role === "moderator"
      ? "/moderator"
      : "/user";

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-5">
      <nav className="relative overflow-hidden rounded-[28px] border border-pink-400/25 bg-black/80 shadow-[0_20px_60px_rgba(255,77,184,0.18)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 text-2xl font-black text-white shadow-xl shadow-pink-500/25">
                ⚡
              </div>

              <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-black bg-emerald-400" />
            </div>

            <div className="leading-tight">
              <p className="text-lg font-black tracking-tight text-white">
                JakSky
              </p>

              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-100">
                VIP Media Gate
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {publicLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-2xl px-4 py-3 text-sm font-black transition",
                  isActive(item.href)
                    ? "bg-pink-500/15 text-pink-200"
                    : "text-pink-100/60 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-2xl border border-pink-400/25 bg-white/10 px-4 py-3 text-sm font-black text-white"
                >
                  {session.avatar ? (
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={session.avatar}
                        alt="avatar"
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      {session.username || "Akun"}
                    </span>
                  ) : (
                    session.username || "Akun"
                  )}
                </Link>

                <Link
                  href="/history"
                  className="rounded-2xl border border-pink-400/25 bg-white/10 px-4 py-3 text-sm font-black text-white"
                >
                  Riwayat
                </Link>

                <button
                  onClick={logout}
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-700 px-4 py-3 text-sm font-black text-white"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-3 text-sm font-black text-white shadow-xl shadow-pink-500/25"
                >
                  Daftar
                </Link>

                <Link
                  href="/login/user"
                  className="rounded-2xl border border-pink-400/25 bg-white/10 px-5 py-3 text-sm font-black text-white"
                >
                  Masuk Akun
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((value) => !value)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/25 bg-white/10 text-2xl font-black text-white shadow-lg lg:hidden"
            aria-label="Buka menu"
          >
            {open ? "×" : "≡"}
          </button>
        </div>

        {open && (
          <div className="border-t border-pink-400/15 bg-black/70 px-4 pb-4 pt-2 lg:hidden">
            <div className="grid gap-2">
              {publicLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "rounded-2xl px-4 py-3 text-sm font-black",
                    isActive(item.href)
                      ? "bg-pink-500/15 text-pink-200"
                      : "bg-white/5 text-pink-100/70",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}

              {session ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Dashboard {session.role || "User"}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Profil
                  </Link>

                  <Link
                    href="/history"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Riwayat
                  </Link>

                  <button
                    onClick={logout}
                    className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-700 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-4 py-3 text-center text-sm font-black text-white"
                    >
                      Daftar
                    </Link>

                    <Link
                      href="/login/user"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl border border-pink-400/25 bg-white/10 px-4 py-3 text-center text-sm font-black text-white"
                    >
                      Masuk
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Link
                      href="/login/owner"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl bg-pink-500/10 px-3 py-3 text-center text-xs font-black text-pink-100"
                    >
                      Owner
                    </Link>

                    <Link
                      href="/login/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl bg-pink-500/10 px-3 py-3 text-center text-xs font-black text-pink-100"
                    >
                      Admin
                    </Link>

                    <Link
                      href="/login/moderator"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl bg-pink-500/10 px-3 py-3 text-center text-xs font-black text-pink-100"
                    >
                      Moderator
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
