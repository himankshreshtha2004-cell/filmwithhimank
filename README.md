# AI Film Portfolio

Your films float around you in glass cards. Plain HTML/CSS/JS — no build step.

## Put it online
Drag this whole folder onto https://app.netlify.com/drop.

## Add your films
1. Put your .mp4 files in `videos/` (H.264 MP4 plays everywhere; keep each under ~20 MB if you can).
2. Open `films.js` and set `src` on a film, e.g. `src: "videos/neon-monsoon.mp4"`.
3. Optional: add a still image to `assets/` and set `poster`.
4. Change titles, years, durations, tools and descriptions in the same file. Your name, bio and
   contact links are in `SITE` at the top of `films.js`.

Films with an empty `src` show an animated placeholder and "Film coming soon".

## Files
- `index.html` — page structure
- `style.css`  — glass look, layout, responsive rules
- `script.js`  — orbit, drag/momentum/snap, hover previews, player morph, panels, dust
- `films.js`   — your content (the only file you need to edit)
- `assets/me-cutout.png` — your photo with the background removed (replace it with a better cutout any time, same name)
- `assets/me-photo.jpg` — your original photo (the sharp background; the cutout is lined up exactly on top of it)

## Controls
Drag / swipe to spin · wheel or ← → to move one film · click or Enter to open · Esc or click outside to close ·
in the player: Space play/pause, ← → previous/next film.
