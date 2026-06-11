from pathlib import Path

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
# PATCH PROFILE PAGE
# =========================

profile_path = Path("app/profile/page.tsx")
s = profile_path.read_text()
Path("app/profile/page.backup-visual-persist.tsx").write_text(s)

profile_helper = '''
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

  function jaskyReadVisualMap(mapKey: string, acc: any, fallback: string) {
    const saved = jaskyReadJSON(mapKey, {});
    const keys = jaskyProfileKeys(acc);

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(saved, key)) {
        return String(saved[key] || fallback);
      }
    }

    return fallback;
  }

  function jaskyPersistVisualProfile() {
    if (!user) return;

    const frame = String(profileFrame || "none");
    const bg = String(profileBg || "purpleLightning");
    const keys = jaskyProfileKeys(user);

    const frameMap = jaskyReadJSON("jasky_profile_frames", {});
    const bgMap = jaskyReadJSON("jasky_profile_bgs", {});

    keys.forEach((key) => {
      frameMap[key] = frame;
      bgMap[key] = bg;
    });

    localStorage.setItem("jasky_profile_frames", JSON.stringify(frameMap));
    localStorage.setItem("jasky_profile_bgs", JSON.stringify(bgMap));

    const current = jaskyReadJSON("jasky_current_user", null);
    const fixedCurrent = {
      ...(current || {}),
      ...user,
      profileFrame: frame,
      profileBg: bg,
    };

    localStorage.setItem("jasky_current_user", JSON.stringify(fixedCurrent));

    const accounts = jaskyReadJSON("jasky_accounts", []);
    const fixedAccounts = accounts.map((acc: any) => {
      const same = jaskyProfileKeys(acc).some((key) => keys.includes(key));

      return same
        ? {
            ...acc,
            profileFrame: frame,
            profileBg: bg,
          }
        : acc;
    });

    localStorage.setItem("jasky_accounts", JSON.stringify(fixedAccounts));

    const contents = jaskyReadJSON("jasky_contents", []);
    const fixedContents = contents.map((content: any) => ({
      ...content,
      comments: (content.comments || []).map((comment: any) => {
        const commentKey = String(comment.user || "").trim().toLowerCase();

        if (!keys.includes(commentKey)) return comment;

        return {
          ...comment,
          avatar: user.avatar || comment.avatar || "",
          title: user.title || comment.title || "Member JakSky",
          bio: user.bio || comment.bio || "",
          profileBg: bg,
          profileFrame: frame,
        };
      }),
    }));

    localStorage.setItem("jasky_contents", JSON.stringify(fixedContents));
  }

'''

if "function jaskyPersistVisualProfile" not in s:
    marker = "  function saveProfile"
    if marker not in s:
        marker = "  return ("
    s = s.replace(marker, profile_helper + marker, 1)

s = s.replace(
    'setProfileBg(active.profileBg || "purpleLightning");',
    'setProfileBg(jaskyReadVisualMap("jasky_profile_bgs", active, active.profileBg || "purpleLightning"));'
)

s = s.replace(
    'setProfileFrame(active.profileFrame || "neon");',
    'setProfileFrame(jaskyReadVisualMap("jasky_profile_frames", active, active.profileFrame || "none"));'
)

s = s.replace(
    'setProfileFrame(active.profileFrame || "none");',
    'setProfileFrame(jaskyReadVisualMap("jasky_profile_frames", active, active.profileFrame || "none"));'
)

if "jaskyPersistVisualProfile();" not in s:
    markers = [
        'localStorage.setItem("jasky_current_user", JSON.stringify(updated));',
        'setToast("✅ Profil berhasil disimpan.");',
        'alert("✅ Profil berhasil disimpan.");',
        'alert("Profil berhasil disimpan.");',
    ]

    inserted = False

    for marker in markers:
        if marker in s:
            s = s.replace(marker, marker + "\n    jaskyPersistVisualProfile();", 1)
            inserted = True
            break

    if not inserted:
        s = s.replace("  function saveProfile", "  function saveProfile", 1)

profile_path.write_text(s)
print("OK profile persist patched")


# =========================
# PATCH USER PAGE
# =========================

user_path = Path("app/user/page.tsx")
u = user_path.read_text()
Path("app/user/page.backup-visual-persist.tsx").write_text(u)

get_comment_frame = '''
  function getCommentFrame(name?: string) {
    const key = String(name || "").trim().toLowerCase();

    const current = getJSON("jasky_current_user", null);
    const staff = getJSON("jasky_staff_session", null);
    const savedAccounts = getJSON("jasky_accounts", []);
    const users = [current, staff, ...savedAccounts].filter(Boolean);

    const found = users.find((acc: any) => {
      const ids = [acc.id, acc.username, acc.email]
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase());

      return ids.includes(key);
    });

    const frameMap = getJSON("jasky_profile_frames", {});

    const keys = [
      key,
      found?.id,
      found?.username,
      found?.email,
    ]
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase());

    for (const item of keys) {
      if (Object.prototype.hasOwnProperty.call(frameMap, item)) {
        return String(frameMap[item] || "none");
      }
    }

    return String(found?.profileFrame || "none");
  }'''

if "function getCommentFrame" in u:
    u, _ = replace_function(u, "  function getCommentFrame", get_comment_frame)
else:
    marker = "  function profile(comment"
    if marker not in u:
        marker = "  function openDetail"
    u = u.replace(marker, get_comment_frame + "\n\n" + marker, 1)

u = u.replace(
    "visibleFrameStyle(p.profileFrame && p.profileFrame !== \"none\" ? p.profileFrame : getCommentFrame(p.username))",
    "visibleFrameStyle(p.profileFrame && p.profileFrame !== \"none\" ? p.profileFrame : getCommentFrame(p.username || comment.user))"
)

u = u.replace(
    "visibleFrameStyle(getCommentFrame(p.username))",
    "visibleFrameStyle(getCommentFrame(p.username || comment.user))"
)

u = u.replace(
    'profileFrame: fresh?.profileFrame || comment.profileFrame || "none",',
    'profileFrame: getCommentFrame(comment.user),'
)

u = u.replace(
    'profileFrame: p.profileFrame,',
    'profileFrame: p.profileFrame && p.profileFrame !== "none" ? p.profileFrame : getCommentFrame(comment.user),'
)

user_path.write_text(u)
print("OK user comment frame patched")
