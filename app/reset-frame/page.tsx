"use client";

import Link from "next/link";

export default function ResetFramePage() {
  function resetFrame() {
    const accounts = JSON.parse(localStorage.getItem("jasky_accounts") || "[]");
    const contents = JSON.parse(localStorage.getItem("jasky_contents") || "[]");

    const fixedAccounts = accounts.map((acc: any) => ({
      ...acc,
      profileFrame: "none",
    }));

    const fixedContents = contents.map((content: any) => ({
      ...content,
      comments: (content.comments || []).map((comment: any) => ({
        ...comment,
        profileFrame: "none",
      })),
    }));

    const current = JSON.parse(localStorage.getItem("jasky_current_user") || "null");
    const staff = JSON.parse(localStorage.getItem("jasky_staff_session") || "null");

    if (current) {
      current.profileFrame = "none";
      localStorage.setItem("jasky_current_user", JSON.stringify(current));
    }

    if (staff) {
      staff.profileFrame = "none";
      localStorage.setItem("jasky_staff_session", JSON.stringify(staff));
    }

    localStorage.setItem("jasky_accounts", JSON.stringify(fixedAccounts));
    localStorage.setItem("jasky_contents", JSON.stringify(fixedContents));

    alert("Semua bingkai avatar sudah dikembalikan ke Tidak Dipakai.");
  }

  return (
    <main className="min-h-screen p-5">
      <div className="jasky-card mx-auto max-w-md p-6 text-center">
        <p className="text-5xl">💎</p>
        <h1 className="mt-4 text-3xl font-black">Reset Bingkai Foto</h1>
        <p className="mt-3 text-pink-100/70">
          Ini menghapus frame lama yang keburu aktif otomatis. Setelah ini avatar akan polos, kecuali user pilih frame sendiri di profil.
        </p>

        <button onClick={resetFrame} className="jasky-button mt-5 w-full py-4">
          Reset Semua Frame
        </button>

        <Link href="/profile" className="mt-3 block rounded-2xl bg-white/10 p-4 font-black">
          Ke Profil
        </Link>

        <Link href="/user" className="mt-3 block rounded-2xl bg-white/10 p-4 font-black">
          Ke User
        </Link>
      </div>
    </main>
  );
}
