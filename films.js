/* ==========================================================================
   YOUR FILMS — the only file you need to edit.

   Each film can play from ONE of these:
     drive: "FILE_ID"            a Google Drive video (the part after /file/d/ in the share link).
                                 In Drive, set Share → General access → "Anyone with the link" (Viewer),
                                 otherwise visitors can't watch it.
     src:   "videos/my-film.mp4" a video file you put in the videos/ folder (plays in my own player).

   poster: "assets/my-cover.jpg" (optional) — your own cover image. Without it, the cover uses the
           video's Drive thumbnail (public files) on top of a colour backdrop made from `mood`.
   duration: "1:24" (optional) — shown on the cards and in the player.
   size: "L", "M" or "S" — card size in the cloud.
   ========================================================================== */

window.SITE = {
  name: "Himank",                    // shown in the top bar, the cards and the player
  role: "AI Filmmaker",
  about:
    "I make short films with AI — writing, directing and editing every frame myself. " +
    "Every frame has a story. Here's mine.",
  email: "you@example.com",
  instagram: "https://instagram.com/yourhandle",
  youtube: "https://youtube.com/@yourchannel",
};

window.FILMS = [
  { title: "Ananta", year: 2026, duration: "0:33", size: "L",
    tools: [], mood: ["#ffb347", "#3d5bff", "#070b1c"],
    description: "Vishnu wakes on the cosmic ocean as demons rise from the deep — a mythic battle told in fire, storm and starlight.",
    src: "videos/film01.mp4", poster: "assets/covers/film01.jpg" },
  { title: "Ardhanari", year: 2026, duration: "0:18", size: "M",
    tools: [], mood: ["#ff9a5a", "#4fd1ff", "#0a0606"],
    description: "Shiva and Shakti, shot like a lost 70s reel — glitter, skin and light, until the two become one.",
    src: "videos/film02.mp4", poster: "assets/covers/film02.jpg" },
  { title: "Two Worlds", year: 2026, duration: "0:55", size: "L",
    tools: [], mood: ["#ffd27a", "#c8553d", "#14100a"],
    description: "A wedding invitation film for Rohan & Reetika — two separate journeys, one story.",
    src: "videos/film03.mp4", poster: "assets/covers/film03.jpg" },
  { title: "Chhau", year: 2026, duration: "0:26", size: "S",
    tools: [], mood: ["#ff7a2e", "#b3172b", "#0c0705"],
    description: "Masks, drums and a ring of fire — the Chhau dance, reimagined in firelight.",
    src: "videos/film04.mp4", poster: "assets/covers/film04.jpg" },
  { title: "The Waterfall", year: 2026, duration: "0:21", size: "M",
    tools: [], mood: ["#9fd8ff", "#c9a36b", "#06121c"],
    description: "A soldier and a woman meet at the foot of a waterfall: a first encounter told in mist and light.",
    src: "videos/film05.mp4", poster: "assets/covers/film05.jpg" },
];
