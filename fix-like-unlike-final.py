from pathlib import Path
import re

p = Path("app/user/page.tsx")
s = p.read_text()
Path("app/user/page.backup-like-unlike-final.tsx").write_text(s)

def replace_function(src: str, start_text: str, new_func: str):
    start = src.find(start_text)
    if start == -1:
        return src, False

    brace = src.find("{", start)
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

# state kecil buat paksa tombol update
if "const [reactionSignal, setReactionSignal]" not in s:
    s = s.replace(
        'const [commentText, setCommentText] = useState("");',
        'const [commentText, setCommentText] = useState("");\n  const [reactionSignal, setReactionSignal] = useState(0);'
    )

# helper actor key
if "function getReactionActorKey" not in s:
    marker = "  function getMyReaction"
    if marker not in s:
        marker = "  function toggleReaction"
    if marker not in s:
        marker = "  function setRating"

    helper = '''
  function getReactionActorKey() {
    return String(user?.id || user?.username || user?.email || "guest");
  }

'''
    s = s.replace(marker, helper + marker, 1)

new_get_my_reaction = '''
  function getMyReaction(item?: Content | null) {
    void reactionSignal;

    if (!item?.id) return "";

    const newer = getJSON("jasky_reactions_by_content", {});
    const legacy = getJSON("jasky_reactions", {});
    const key = getReactionActorKey();

    return newer?.[item.id]?.[key] || legacy?.[item.id] || "";
  }'''

if "function getMyReaction" in s:
    s, _ = replace_function(s, "  function getMyReaction", new_get_my_reaction)
else:
    marker = "  function toggleReaction"
    if marker not in s:
        marker = "  function setRating"
    s = s.replace(marker, new_get_my_reaction + "\n\n" + marker, 1)

new_handle = '''
  function handleJaskyReaction(type: "like" | "unlike") {
    if (!selected) return;

    const key = getReactionActorKey();
    const reactionStore = getJSON("jasky_reactions_by_content", {});
    const contentStore = { ...(reactionStore[selected.id] || {}) };
    const oldReaction = contentStore[key] || "";

    let likesChange = 0;
    let unlikesChange = 0;

    if (oldReaction === type) {
      delete contentStore[key];

      if (type === "like") likesChange = -1;
      if (type === "unlike") unlikesChange = -1;
    } else {
      contentStore[key] = type;

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

    let nextSelected = selected;

    const updated = contents.map((item) => {
      if (item.id !== selected.id) return item;

      nextSelected = {
        ...item,
        likes: Math.max(0, (item.likes || 0) + likesChange),
        unlikes: Math.max(0, (item.unlikes || 0) + unlikesChange),
      };

      return nextSelected;
    });

    saveContents(updated);
    setSelected(nextSelected);
    setReactionSignal((value) => value + 1);
    notifyJaskySync();
  }'''

if "function handleJaskyReaction" in s:
    s, _ = replace_function(s, "  function handleJaskyReaction", new_handle)
else:
    marker = "  function toggleReaction"
    if marker not in s:
        marker = "  function setRating"
    s = s.replace(marker, new_handle + "\n\n" + marker, 1)

# pastikan dua nama function tetap ada
if "function toggleReaction" in s:
    s, _ = replace_function(
        s,
        "  function toggleReaction",
        '''  function toggleReaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }'''
    )
else:
    marker = "  function setRating"
    s = s.replace(
        marker,
        '''  function toggleReaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }

''' + marker,
        1
    )

if "function reaction" in s:
    s, _ = replace_function(
        s,
        "  function reaction",
        '''  function reaction(type: "like" | "unlike") {
    handleJaskyReaction(type);
  }'''
    )

# replace tombol like/unlike di modal detail
like_button = '''
              <button
                onClick={() => toggleReaction("like")}
                className={[
                  "rounded-2xl p-4 font-black transition border",
                  getMyReaction(selected) === "like"
                    ? "jasky-action-selected border-pink-400 bg-gradient-to-r from-pink-500 to-purple-700 text-white"
                    : "border-white/10 bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                {getMyReaction(selected) === "like" ? "✅ Disukai" : "👍 Like"}
              </button>'''

unlike_button = '''
              <button
                onClick={() => toggleReaction("unlike")}
                className={[
                  "rounded-2xl p-4 font-black transition border",
                  getMyReaction(selected) === "unlike"
                    ? "border-rose-400 bg-gradient-to-r from-rose-500 to-red-700 text-white shadow-[0_14px_35px_rgba(244,63,94,.25)]"
                    : "border-white/10 bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                {getMyReaction(selected) === "unlike" ? "✅ Tidak suka" : "👎 Unlike"}
              </button>'''

s = re.sub(
    r'<button\s+onClick=\{\(\) => (?:toggleReaction|reaction)\("like"\)\}[\s\S]*?</button>',
    like_button,
    s,
    count=1
)

s = re.sub(
    r'<button\s+onClick=\{\(\) => (?:toggleReaction|reaction)\("unlike"\)\}[\s\S]*?</button>',
    unlike_button,
    s,
    count=1
)

p.write_text(s)
print("DONE: Like/Unlike final aktif dengan tanda.")
