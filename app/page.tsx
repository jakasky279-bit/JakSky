import Link from "next/link";
import JakSkyNavbar from "@/components/JakSkyNavbar";

const features = [
  {
    icon: "🎬",
    title: "Konten Gratis & VIP",
    desc: "Nikmati konten publik dan konten premium khusus member VIP dalam satu platform.",
  },
  {
    icon: "⚡",
    title: "Realtime Online",
    desc: "Update konten, komentar, dan pesan dibuat agar terasa cepat dan responsif.",
  },
  {
    icon: "🛡️",
    title: "Moderasi Komunitas",
    desc: "Moderator dapat memantau, membalas, menyembunyikan, atau menghapus komentar.",
  },
  {
    icon: "👑",
    title: "Owner Control",
    desc: "Owner mengatur akun, role, title, VIP, admin, moderator, dan akses platform.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen pb-8 pt-3">
      <JakSkyNavbar />

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="jasky-card p-5 md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 text-5xl shadow-2xl shadow-pink-500/30">
              ⚡
            </div>

            <h1 className="jasky-title mt-5 text-5xl font-black tracking-tight md:text-7xl">
              JakSky
            </h1>

            <p className="mt-3 text-sm font-black uppercase tracking-[0.22em] text-pink-100 md:text-base">
              Premium Video Gate • VIP Access • Fast Update
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-pink-100/70 md:text-lg">
              Platform media premium untuk menikmati konten gratis dan VIP
              dengan tampilan modern, komunitas aktif, dan sistem kontrol yang
              lengkap.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="jasky-mini-card p-4 text-center">
              <p className="text-2xl font-black md:text-3xl">30</p>
              <p className="mt-1 text-[11px] font-bold text-pink-100/60">
                Video/upload
              </p>
            </div>

            <div className="jasky-mini-card p-4 text-center">
              <p className="text-2xl font-black md:text-3xl">2GB</p>
              <p className="mt-1 text-[11px] font-bold text-pink-100/60">
                Per video
              </p>
            </div>

            <div className="jasky-mini-card p-4 text-center">
              <p className="text-2xl font-black md:text-3xl">VIP</p>
              <p className="mt-1 text-[11px] font-bold text-pink-100/60">
                Premium
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/register" className="jasky-button px-5 py-4 text-center">
              Daftar
            </Link>

            <Link
              href="/login/user"
              className="rounded-[18px] border border-pink-400/30 bg-white/10 px-5 py-4 text-center font-black text-white"
            >
              Masuk Akun
            </Link>
          </div>
        </div>

        <div className="mt-5 jasky-card p-4 md:p-5">
          <div className="aspect-video overflow-hidden rounded-[28px] border border-pink-400/20 bg-gradient-to-br from-sky-100 via-white to-blue-100 p-4">
            <div className="flex h-full items-center justify-center rounded-[24px] bg-white/40">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-400 to-blue-700 text-4xl font-black text-white shadow-2xl">
                  ▶
                </div>

                <p className="mt-5 text-2xl font-black text-slate-950">JakSky Player</p>

                <p className="mt-2 px-5 text-sm font-black text-slate-700 drop-shadow-none">Tonton konten gratis dan VIP dengan player yang ringan dan nyaman.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {features.map((item) => (
            <div key={item.title} className="jasky-card p-5">
              <p className="text-3xl">{item.icon}</p>
              <h2 className="mt-4 text-lg font-black text-white">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-pink-100/65">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <footer className="jasky-card mt-6 p-5 text-center">
          <p className="text-sm text-pink-100/60">
            © 2026 JakSky. Platform media premium untuk komunitas digital.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-black text-pink-100/80">
            <Link href="/about">Tentang</Link>
            <Link href="/help">Bantuan</Link>
            <Link href="/privacy">Privasi</Link>
            <Link href="/terms">Ketentuan</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
