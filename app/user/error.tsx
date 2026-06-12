"use client";

export default function UserError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  function clearCache() {
    try {
      localStorage.removeItem("jasky_contents");
      localStorage.removeItem("jasky_favorites");
      localStorage.removeItem("jasky_reactions");
      localStorage.removeItem("jasky_ratings");
      localStorage.removeItem("jasky_viewed_content");
    } catch {}

    reset();
    window.location.href = "/user?v=reset-cache";
  }

  return (
    <main className="min-h-screen px-5 py-12 text-white">
      <section className="mx-auto max-w-xl rounded-[32px] border border-pink-400/20 bg-black/70 p-7 text-center shadow-2xl">
        <div className="text-6xl">⚠️</div>
        <h1 className="mt-4 text-3xl font-black">Halaman user perlu reset</h1>
        <p className="mt-3 text-white/60">
          Cache video lama di browser bentrok setelah konten online dihapus.
        </p>

        <button
          onClick={clearCache}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-700 px-5 py-4 font-black text-white"
        >
          Bersihkan Cache & Buka Lagi
        </button>

        <a
          href="/"
          className="mt-3 block rounded-2xl border border-white/10 bg-white/10 px-5 py-4 font-black text-white/70"
        >
          Kembali ke Beranda
        </a>
      </section>
    </main>
  );
}
