import Link from "next/link";
import JakSkyNavbar from "@/components/JakSkyNavbar";

export const metadata = {
  title: "Ketentuan Layanan",
};

export default function TermsPage() {
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
            Ketentuan Layanan
          </h1>

          <p className="text-slate-600 leading-8 mt-5">
            Dengan menggunakan JakSky, pengguna setuju untuk memakai platform
            secara bertanggung jawab, menghormati pengguna lain, dan tidak
            menyalahgunakan fitur komentar, rating, pesan, maupun akses konten.
          </p>

          <div className="space-y-4 mt-8">
            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Akun Pengguna</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Pengguna bertanggung jawab menjaga keamanan akun masing-masing
                dan menggunakan data login dengan benar.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Konten & Komentar</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Komentar yang mengganggu, menipu, merugikan, atau tidak sesuai
                dapat disembunyikan atau dihapus oleh moderator.
              </p>
            </div>

            <div className="jasky-mini-card p-5">
              <h2 className="font-black text-lg">Akses VIP</h2>
              <p className="text-slate-500 leading-7 mt-2">
                Akses VIP mengikuti status akun dan pengaturan yang diberikan
                oleh sistem atau pengelola platform.
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
