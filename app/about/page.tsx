import Link from "next/link";
import JakSkyNavbar from "@/components/JakSkyNavbar";

export const metadata = {
  title: "Tentang JakSky",
};

export default function AboutPage() {
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
            Tentang JakSky
          </h1>

          <p className="text-slate-600 leading-8 mt-5 text-lg">
            JakSky adalah platform media premium yang dirancang untuk menghadirkan
            pengalaman menonton yang lebih rapi, modern, dan nyaman. Platform ini
            mendukung konten gratis, konten VIP, komentar user, sistem rating,
            favorit, serta pengelolaan akun oleh owner, admin, dan moderator.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="jasky-mini-card p-5">
              <p className="text-3xl">🎬</p>
              <h2 className="font-black mt-3">Media Platform</h2>
              <p className="text-slate-500 text-sm leading-6 mt-2">
                Dibuat untuk upload, menampilkan, dan mengelola konten video.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <p className="text-3xl">💎</p>
              <h2 className="font-black mt-3">VIP System</h2>
              <p className="text-slate-500 text-sm leading-6 mt-2">
                User dapat memiliki status gratis atau VIP sesuai akses akun.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <p className="text-3xl">🛡️</p>
              <h2 className="font-black mt-3">Moderasi</h2>
              <p className="text-slate-500 text-sm leading-6 mt-2">
                Moderator membantu menjaga komentar dan interaksi tetap nyaman.
              </p>
            </div>
          </div>
        </div>
      </section>
          </div>
    </main>
  );
}
