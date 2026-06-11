from pathlib import Path
import re

def replace_function(src: str, start_text: str, new_func: str):
    start = src.find(start_text)
    if start == -1:
        return src, False

    brace = src.find("{", start)
    if brace == -1:
        return src, False

    depth = 0
    end = brace

    for i in range(brace, len(src)):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    return src[:start] + new_func.rstrip() + "\n\n" + src[end:], True


# =========================
# USER PAGE FINAL FIX
# =========================

user_path = Path("app/user/page.tsx")
s = user_path.read_text()
Path("app/user/page.backup-final-polish.tsx").write_text(s)

if "function getJSON" not in s:
    marker = "  function loadData"
    helper = '''
  function getJSON(key: string, fallback: any) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

'''
    s = s.replace(marker, helper + marker, 1)

helpers = '''
  function notifyJaskySync() {
    try {
      window.dispatchEvent(new Event("jasky-sync"));
    } catch {}

    try {
      const channel = new BroadcastChannel("jasky-realtime");
      channel.postMessage({ type: "sync", at: Date.now() });
      channel.close();
    } catch {}
  }

  function actorKey() {
    return String(user?.id || user?.username || user?.email || "guest");
  }

  function getMyReaction(item?: Content | null) {
    if (!item?.id) return "";

    const newer = getJSON("jasky_reactions_by_content", {});
    const legacy = getJSON("jasky_reactions", {});

    return newer?.[item.id]?.[actorKey()] || legacy?.[item.id] || "";
  }

  function getMyRating(item?: Content | null) {
    if (!item?.id) return 0;

    const newer = getJSON("jasky_ratings_by_content", {});
    const legacy = getJSON("jasky_ratings", {});

    return Number(newer?.[item.id]?.[actorKey()] || legacy?.[item.id] || 0);
  }

'''

if "function notifyJaskySync" not in s:
    marker = "  function saveContents"
    if marker not in s:
        marker = "  function openDetail"
    s = s.replace(marker, helpers + marker, 1)

new_save = '''
  function saveContents(updated: Content[]) {
    setContents(updated);
    localStorage.setItem("jasky_contents", JSON.stringify(updated));

    setSelected((prev) => {
      if (!prev) return prev;
      return updated.find((item) => item.id === prev.id) || prev;
    });

    notifyJaskySync();
  }'''

if "function saveContents" in s:
    s, _ = replace_function(s, "  function saveContents", new_save)

realtime_effect = '''
  // jasky-realtime-final
  useEffect(() => {
    function syncRealtime() {
      const nextContents: Content[] = getJSON("jasky_contents", []);
      const nextAccounts: Account[] = getJSON("jasky_accounts", []);
      const nextFavorites: string[] = getJSON("jasky_favorites", []);

      setContents(nextContents);
      setAccounts(nextAccounts);
      setFavorites(nextFavorites);

      setSelected((prev) => {
        if (!prev) return prev;
        return nextContents.find((item) => item.id === prev.id) || prev;
      });

      const loginId = localStorage.getItem("jasky_login_user_id");
      const current = getJSON("jasky_current_user", null);

      const fresh =
        nextAccounts.find((acc) => acc.id === loginId) ||
        nextAccounts.find((acc) => acc.id === current?.id) ||
        current;

      if (fresh) {
        setUser(fresh);
      }
    }

    function onSync() {
      syncRealtime();
    }

    window.addEventListener("storage", onSync);
    window.addEventListener("jasky-sync", onSync);

    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel("jasky-realtime");
      channel.onmessage = onSync;
    } catch {}

    const timer = window.setInterval(syncRealtime, 1200);

    return () => {
      window.removeEventListener("storage", onSync);
      window.removeEventListener("jasky-sync", onSync);
      window.clearInterval(timer);

      if (channel) {
        channel.close();
      }
    };
  }, []);

'''

if "jasky-realtime-final" not in s:
    marker = "  function saveContents"
    s = s.replace(marker, realtime_effect + "\n" + marker, 1)

reaction_core = '''
  function handleJaskyReaction(type: "like" | "unlike") {
    if (!selected) return;

    const reactionStore = getJSON("jasky_reactions_by_content", {});
    const contentStore = reactionStore[selected.id] || {};
    const oldReaction = contentStore[actorKey()] || "";

    let likesChange = 0;
    let unlikesChange = 0;

    if (oldReaction === type) {
      delete contentStore[actorKey()];

      if (type === "like") likesChange = -1;
      if (type === "unlike") unlikesChange = -1;
    } else {
      contentStore[actorKey()] = type;

      if (type === "like") {
        likesChange = 1;
        if (oldReaction === "unlike") unlikesChange = -1;
      }

      if (type === "unlike") {
        unlikesChange = 1;
        if (oldReaction === "like") likesChange = -1;
      }
    }

    reactionStore[selected.id] = contentStore;
    localStorage.setItem("jasky_reactions_by_content", JSON.stringify(reactionStore));

    const updated = contents.map((item) => {
      if (item.id !== selected.id) return item;

      return {
        ...item,
        likes: Math.max(0, (item.likes || 0) + likesChange),
        unlikes: Math.max(0, (item.unlikes || 0) + unlikesChange),
      };
    });

    saveContents(updated);
  }

  function toggleReaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }

  function reaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }'''

if "function handleJaskyReaction" not in s:
    for fname in ["  function toggleReaction", "  function reaction"]:
        if fname in s:
            s, _ = replace_function(s, fname, reaction_core)
            break
    else:
        marker = "  function setRating"
        if marker not in s:
            marker = "  function addComment"
        s = s.replace(marker, reaction_core + "\n\n" + marker, 1)
else:
    if "function toggleReaction" in s:
        s, _ = replace_function(s, "  function toggleReaction", '  function toggleReaction(type: "like" | "unlike") {\n    handleJaskyReaction(type);\n  }')
    if "function reaction" in s:
        s, _ = replace_function(s, "  function reaction", '  function reaction(type: "like" | "unlike") {\n    handleJaskyReaction(type);\n  }')

rating_core = '''
  function handleJaskyRating(value: number) {
    if (!selected || !value) return;

    const ratingStore = getJSON("jasky_ratings_by_content", {});
    const contentRatings = ratingStore[selected.id] || {};

    contentRatings[actorKey()] = value;
    ratingStore[selected.id] = contentRatings;

    localStorage.setItem("jasky_ratings_by_content", JSON.stringify(ratingStore));

    const allRatings = Object.values(contentRatings)
      .map((item) => Number(item))
      .filter((item) => item > 0);

    const updated = contents.map((item) => {
      if (item.id !== selected.id) return item;

      return {
        ...item,
        ratings: allRatings.length > 0 ? allRatings : [value],
      };
    });

    saveContents(updated);
  }

  function setRating(value: number) {
    handleJaskyRating(value);
  }

  function rate(value: number) {
    handleJaskyRating(value);
  }'''

if "function handleJaskyRating" not in s:
    if "function setRating" in s:
        s, _ = replace_function(s, "  function setRating", rating_core)
    elif "function rate" in s:
        s, _ = replace_function(s, "  function rate", rating_core)
    else:
        marker = "  function addComment"
        s = s.replace(marker, rating_core + "\n\n" + marker, 1)

# komentar baru realtime + profile visual
if "notifyJaskySync();" not in s.split("function addComment", 1)[-1].split("function", 1)[0]:
    s = s.replace("    setCommentText(\"\");", "    setCommentText(\"\");\n    notifyJaskySync();", 1)

# fix badge Aktif/Mati yang pernah kena style frame
s = s.replace(
    'className="mt-2 text-xs font-black text-blue-200" style={avatarFrameStyle(user?.profileFrame)}',
    'className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-black text-blue-100"'
)
s = s.replace(
    'className="mt-2 text-xs font-black text-blue-200" style={visibleFrameStyle(user?.profileFrame)}',
    'className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-black text-blue-100"'
)
s = re.sub(
    r'(<div className="mt-2[^"]*")\s+style=\{avatarFrameStyle\(user\?\.profileFrame\)\}',
    r'\1',
    s
)
s = re.sub(
    r'(<div className="mt-2[^"]*")\s+style=\{visibleFrameStyle\(user\?\.profileFrame\)\}',
    r'\1',
    s
)

# select rating controlled biar kelihatan rating user
s = s.replace(
    'defaultValue=""\n                onChange={(e) => setRating(Number(e.target.value))}',
    'value={selected ? String(getMyRating(selected) || "") : ""}\n                onChange={(e) => setRating(Number(e.target.value))}'
)
s = s.replace(
    'defaultValue=""\n                onChange={(e) => rate(Number(e.target.value))}',
    'value={selected ? String(getMyRating(selected) || "") : ""}\n                onChange={(e) => rate(Number(e.target.value))}'
)

# jangan sampai ada fallback neon
s = s.replace('profileFrame || "neon"', 'profileFrame || "none"')
s = s.replace('p.profileFrame || "neon"', 'p.profileFrame || "none"')
s = s.replace('comment.profileFrame || "neon"', 'comment.profileFrame || "none"')
s = s.replace('user?.profileFrame || "neon"', 'user?.profileFrame || "none"')

user_path.write_text(s)
print("OK user page final fixed")


# =========================
# PROFILE PAGE FINAL FIX
# =========================

profile_path = Path("app/profile/page.tsx")
if profile_path.exists():
    ps = profile_path.read_text()
    Path("app/profile/page.backup-final-polish.tsx").write_text(ps)

    if "function jaskyReadJSON" not in ps:
        marker = "  function saveProfile"
        if marker not in ps:
            marker = "  return ("
        helper = '''
  function jaskyReadJSON(key: string, fallback: any) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function jaskyProfileKeys(acc: any) {
    return [acc?.id, acc?.username, acc?.email]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());
  }

  function persistProfileVisuals(targetUser: any = user) {
    if (!targetUser) return;

    const frame = String(profileFrame || "none");
    const bg = String(profileBg || "purpleLightning");
    const keys = jaskyProfileKeys(targetUser);

    const frameMap = jaskyReadJSON("jasky_profile_frames", {});
    const bgMap = jaskyReadJSON("jasky_profile_bgs", {});

    keys.forEach((key) => {
      frameMap[key] = frame;
      bgMap[key] = bg;
    });

    localStorage.setItem("jasky_profile_frames", JSON.stringify(frameMap));
    localStorage.setItem("jasky_profile_bgs", JSON.stringify(bgMap));

    const current = jaskyReadJSON("jasky_current_user", null);
    if (current) {
      localStorage.setItem(
        "jasky_current_user",
        JSON.stringify({ ...current, profileFrame: frame, profileBg: bg })
      );
    }

    const accounts = jaskyReadJSON("jasky_accounts", []);
    const fixedAccounts = accounts.map((acc: any) => {
      const same = jaskyProfileKeys(acc).some((key) => keys.includes(key));
      return same ? { ...acc, profileFrame: frame, profileBg: bg } : acc;
    });

    localStorage.setItem("jasky_accounts", JSON.stringify(fixedAccounts));

    try {
      window.dispatchEvent(new Event("jasky-sync"));
    } catch {}
  }

'''
        ps = ps.replace(marker, helper + marker, 1)

    if "persistProfileVisuals();" not in ps:
        ps = ps.replace(
            'setToast("✅ Profil berhasil disimpan.");',
            'persistProfileVisuals();\n    setToast("✅ Profil berhasil disimpan.");'
        )
        ps = ps.replace(
            'alert("✅ Profil berhasil disimpan.");',
            'persistProfileVisuals();\n    alert("✅ Profil berhasil disimpan.");'
        )
        ps = ps.replace(
            'alert("Profil berhasil disimpan.");',
            'persistProfileVisuals();\n    alert("Profil berhasil disimpan.");'
        )

    profile_path.write_text(ps)
    print("OK profile page final fixed")


# =========================
# CSS POLISH
# =========================

css_path = Path("app/globals.css")
css = css_path.read_text() if css_path.exists() else ""

extra_css = r'''

/* === JAKSKY FINAL POLISH === */
.jasky-status-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, .25);
  background: rgba(2, 6, 23, .45);
  padding: 6px 10px;
  color: #dbeafe;
  box-shadow: none !important;
}

.jasky-comment-card {
  border: 1px solid rgba(236, 72, 153, .18);
  background: linear-gradient(135deg, rgba(255,255,255,.09), rgba(255,255,255,.04));
  box-shadow: 0 18px 45px rgba(0,0,0,.28);
  backdrop-filter: blur(16px);
}

.jasky-realtime-dot {
  display: inline-flex;
  height: 9px;
  width: 9px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34,197,94,.12), 0 0 22px rgba(34,197,94,.65);
}

.jasky-action-selected {
  border: 1px solid rgba(236,72,153,.55) !important;
  background: linear-gradient(135deg, rgba(236,72,153,.45), rgba(124,58,237,.45)) !important;
  color: white !important;
  box-shadow: 0 15px 35px rgba(236,72,153,.2) !important;
}

video {
  background: #020617;
}

input,
textarea,
select {
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  border-color: rgba(236,72,153,.75) !important;
  box-shadow: 0 0 0 4px rgba(236,72,153,.12) !important;
}
'''

if "JAKSKY FINAL POLISH" not in css:
    css += extra_css
    css_path.write_text(css)
    print("OK css final polish added")
else:
    print("CSS final polish already exists")
