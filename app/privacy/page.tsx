import Link from "next/link";
import JakSkyNavbar from "@/components/JakSkyNavbar";

export const metadata = {
  title: "Kebijakan Privasi",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-4">
      <JakSkyNavbar />
      <div className="px-5 pt-6">
      <section className="mx-auto max-w-4xl">
        <div className="jasky-card p-6 md:p-10">
          <Link href="/" className="jasky-badge inline-block">
            ← Kembali ke Beranda
          </Link>

          <h1 className="jasky-title text-4xl md:text-6xl font-black mt-6">
            Kebijakan Privasi
          </h1>

          <p className="text-slate-600 leading-8 mt-5">
            JakSky menghargai privasi pengguna. Data akun digunakan untuk
            menjalankan fitur login, status VIP, komentar, rating, favorit, dan
            akses konten di dalam platform.
          </p>

          <div className="space-y-4 mt-8">
            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Data yang Diproses</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Data yang dapat diproses meliputi username, email, status akun,
                title, komentar, rating, reaksi, dan aktivitas konten.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Penggunaan Data</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Data digunakan untuk memberikan akses akun, menampilkan profil,
                menjaga keamanan platform, dan meningkatkan pengalaman pengguna.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Keamanan</h2>
              <p className="text-slate-500 leading-7 mt-2">
                JakSky berupaya menjaga data pengguna dengan pembatasan akses,
                pengelolaan role, dan sistem moderasi platform.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8">
            Catatan: halaman ini adalah template awal dan dapat disesuaikan lagi
            sebelum platform digunakan secara komersial.
          </p>
        </div>
      </section>
          </div>
    </main>
  );
}
