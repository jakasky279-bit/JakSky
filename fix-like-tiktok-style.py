from pathlib import Path
import re

p = Path("app/user/page.tsx")
s = p.read_text()

Path("app/user/page.backup-like-tiktok-style.tsx").write_text(s)

like_button = '''              <button
                onClick={() => toggleReaction("like")}
                className={[
                  "rounded-2xl p-4 font-black transition border shadow-lg",
                  currentReaction === "like"
                    ? "border-red-300 bg-gradient-to-r from-red-500 via-pink-500 to-rose-700 text-white shadow-[0_0_35px_rgba(244,63,94,.55)] scale-[1.02]"
                    : "border-white/10 bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                {currentReaction === "like" ? "❤️ Like" : "🤍 Like"}
              </button>'''

unlike_button = '''              <button
                onClick={() => toggleReaction("unlike")}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 font-black text-white shadow-lg transition hover:bg-white/15"
              >
                👎 Unlike
              </button>'''

like_patterns = [
    r'<button\s+onClick=\{\(\) => toggleReaction\("like"\)\}[\s\S]*?</button>',
    r'<button\s+onClick=\{\(\) => reaction\("like"\)\}[\s\S]*?</button>',
    r'<button\s+onClick=\{\(\) => handleJaskyReaction\("like"\)\}[\s\S]*?</button>',
]

unlike_patterns = [
    r'<button\s+onClick=\{\(\) => toggleReaction\("unlike"\)\}[\s\S]*?</button>',
    r'<button\s+onClick=\{\(\) => reaction\("unlike"\)\}[\s\S]*?</button>',
    r'<button\s+onClick=\{\(\) => handleJaskyReaction\("unlike"\)\}[\s\S]*?</button>',
]

for pat in like_patterns:
    s, count = re.subn(pat, like_button, s, count=1)
    if count:
        break

for pat in unlike_patterns:
    s, count = re.subn(pat, unlike_button, s, count=1)
    if count:
        break

# Hapus teks lama kalau masih ada
s = s.replace("❤️ Like Aktif", "❤️ Like")
s = s.replace("💔 Unlike Aktif", "👎 Unlike")
s = s.replace("✅ Disukai", "❤️ Like")
s = s.replace("✅ Tidak suka", "👎 Unlike")

p.write_text(s)

print("DONE: Like sekarang merah seperti TikTok, Unlike tetap biasa.")
