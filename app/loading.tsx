export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="jasky-card p-8 text-center max-w-sm w-full">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-700 animate-pulse" />
        <h1 className="text-2xl font-black mt-5">Memuat JakSky...</h1>
        <p className="text-slate-500 mt-2">
          Tunggu sebentar, halaman sedang disiapkan.
        </p>
      </div>
    </main>
  );
}
