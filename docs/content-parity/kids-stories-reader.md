# Illustrated stories for kids

Entry: Home → Stories for Kids → Krishna / Ganesha / Hanuman → a deity's story shelf → story reader. The library, shelves and reader are lazy Home-stack routes so the corpus and reader artwork do not enter the initial launch graph. Home shows one small, deity-neutral picture-book illustration.

The first published story, The Birth of Krishna, has sixteen short pages with authored Hindi, English, Gujarati and Kannada narration. `mobile/src/data/kidsStories/krishna-janma.json` stores its deity id, stable story/page IDs, language-independent artwork keys and translated titles/text. The deity catalog in `mobile/src/data/kidsStories/index.ts` supplies the three shelves. Krishna also shows a disabled Kaliya Nag teaser; Ganesha and Hanuman shelves have honest empty states until reviewed stories ship. Regional prose is translated rather than Hindi transliteration. Native Gujarati and Kannada copy should receive editorial review before release.

`KidsStoryReaderScreen` uses the existing persisted reading-language context and language picker. Changing the locale keeps the current page index and artwork. Caption and optional dialogue render as native text below the image with natural height, script-specific fonts and the existing reading-size tokens. Scenes use a horizontal paginated FlatList, matching the app reader convention. Each scene scrolls vertically when a translation or accessibility font setting needs extra room; text is not baked into the image.

All sixteen scenes use bundled, text-free WebP illustrations in the approved muted pastel style; some consecutive scenes share artwork. The closing Gokul scene has its own illustration instead of reusing the prison birth cover. The powerful Yamuna crossing is preserved. The birth scene is the library cover, and the preview opens at the first page. All languages share the same artwork; no SVG placeholders remain.

Optional `dialogue` carries translated speaker/text fields. Optional `audio` can hold real locale-specific recording references in future; no audio controls are exposed until recordings and playback are implemented.

Prototypes: `docs/kids-stories-home-prototype.html` previews the dedicated Home card between Categories and Discover; `docs/kids-stories-catalog-prototype.html` demonstrates choosing a deity and a story; `docs/kids-stories-prototype.html` uses the same four-language story dataset and artwork as the native reader. The reader preview demonstrates changing language on any page, previous/next navigation (the native reader also swipes horizontally) and the final takeaway. These are browser previews; native screen/device testing is still required.

Validation: `npx tsx --test src/data/__tests__/kidsStories.test.ts` from `mobile/`. Check the reader on a small phone with large reading text in all four languages before release.
