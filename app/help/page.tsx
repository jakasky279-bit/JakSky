import Link from "next/link";
import JakSkyNavbar from "@/components/JakSkyNavbar";

export const metadata = {
  title: "Bantuan",
};

export default function HelpPage() {
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
            Pusat Bantuan
          </h1>

          <p className="text-slate-600 leading-8 mt-5 text-lg">
            Butuh bantuan menggunakan JakSky? Berikut panduan singkat untuk
            memahami fitur utama platform.
          </p>

          <div className="space-y-4 mt-8">
            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Bagaimana cara membuat akun?</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Buka halaman registrasi, isi username, email, dan password.
                Setelah berhasil, kamu akan diarahkan ke halaman user.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Apa itu akun VIP?</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Akun VIP adalah akun dengan akses premium yang dapat membuka
                konten khusus sesuai pengaturan platform.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Siapa yang bisa upload konten?</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Konten diupload oleh admin yang dibuat dan dikelola oleh owner.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Bagaimana komentar dimoderasi?</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Moderator dapat melihat komentar user, membalas, menyembunyikan,
                atau menghapus komentar yang tidak sesuai.
              </p>
            </div>
          </div>
        </div>
      </section>
          </div>
    </main>
  );
}
