# Vedansh Facebook Page cover

`build.mjs` renders a 1640×924 cover:
- **Left:** the English and Hindi wordmarks, a Hindi-led headline and eight painted-icon feature chips with bilingual labels.
- **Right:** a fan of five real app screens from the feature reels (Krishna daily card, kids' story, Japa, Panchang and Kundali).

```sh
node marketing/reels/showcases/fb-cover/build.mjs   # → marketing/reels/out/fb-cover/
```

Facebook shows the cover at 820×312 on desktop and 640×360 on phones, per Meta's Page cover guidance (recheck this before each upload). At 1640×924 (16:9), phones show the whole image, while desktop shows only the centre 1640×624 band (y 150–774). The build fails if any text falls outside that band. Text also stays clear of the bottom-left corner, where the profile photo overlaps. `review-safe-zones.png` marks both zones, and `preview-desktop-1640x624.png` shows the desktop crop. Upload the PNG: Facebook recommends PNG for covers with text or logos.

All claims come from the 1.5.0 store copy, and the screens are the same committed native captures used in the reels. Nothing is uploaded.

## Profile picture

`python marketing/reels/showcases/fb-cover/profile.py` writes `vedansh-fb-profile-1080.png`. It is the approved app icon (yantra) scaled to 86% on a matching parchment field. Facebook crops profile pictures to a circle (176 px on desktop, 196 px on phones), and at full size the icon's outer ring touches the crop and would be clipped. `preview-profile-circle.png` shows both crop sizes.
