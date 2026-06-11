from pathlib import Path

p = Path("app/profile/page.tsx")
s = p.read_text()

Path("app/profile/page.backup-logout-buttons.tsx").write_text(s)

logout_func = '''
  function logoutUser() {
    const confirmLogout = confirm("Keluar dari akun ini?");

    if (!confirmLogout) return;

    localStorage.removeItem("jasky_current_user");
    localStorage.removeItem("jasky_login_user_id");
    localStorage.removeItem("jasky_staff_session");

    try {
      window.dispatchEvent(new Event("jasky-sync"));
    } catch {}

    window.location.href = "/";
  }

  function goLogin() {
    window.location.href = "/login/user";
  }

  function goRegister() {
    window.location.href = "/register";
  }

'''

if "function logoutUser()" not in s:
    marker = "  return ("
    s = s.replace(marker, logout_func + marker, 1)

logout_box = '''
        <div className="mt-6 rounded-[28px] border border-pink-400/25 bg-black/40 p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
          <h2 className="text-2xl font-black text-white">Akun</h2>
          <p className="mt-2 text-sm font-medium text-pink-100/60">
            Kelola akses akun kamu. Kalau keluar, kamu akan diarahkan ke halaman daftar dan masuk.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={goRegister}
              className="rounded-2xl border border-pink-400/30 bg-white/10 px-4 py-4 font-black text-white transition hover:bg-white/15"
            >
              Daftar Baru
            </button>

            <button
              type="button"
              onClick={goLogin}
              className="rounded-2xl border border-blue-400/30 bg-blue-500/20 px-4 py-4 font-black text-blue-100 transition hover:bg-blue-500/30"
            >
              Masuk Akun
            </button>

            <button
              type="button"
              onClick={logoutUser}
              className="rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-500 to-rose-700 px-4 py-4 font-black text-white shadow-[0_14px_35px_rgba(244,63,94,.22)] transition hover:scale-[1.01]"
            >
              Keluar Akun
            </button>
          </div>
        </div>
'''

if "Keluar Akun" not in s:
    # Sisipkan sebelum penutup main terakhir
    idx = s.rfind("</main>")
    if idx != -1:
        s = s[:idx] + logout_box + "\n" + s[idx:]
    else:
        idx = s.rfind("</div>")
        s = s[:idx] + logout_box + "\n" + s[idx:]

p.write_text(s)
print("DONE: tombol Daftar, Masuk, dan Logout ditambahkan di Profile.")
