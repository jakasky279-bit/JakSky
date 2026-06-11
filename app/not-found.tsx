import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="jasky-card p-8 text-center max-w-md w-full">
        <div className="text-6xl">🌤️</div>
        <h1 className="text-4xl font-black mt-5 jasky-title">
          Halaman tidak ditemukan
        </h1>
        <p className="text-slate-500 mt-3">
          Link yang kamu buka tidak tersedia atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="jasky-button inline-block mt-6 px-6 py-4"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
