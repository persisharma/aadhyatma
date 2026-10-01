# Illustrated stories for kids

Entry: More → Stories for Kids → The Birth of Krishna. Reader and library are lazy routes so the corpus and artwork do not enter the initial launch graph.

The first story has ten short pages with authored Hindi, English, Gujarati and Kannada narration. `mobile/src/data/kidsStories/krishna-janma.json` stores stable story/page IDs, language-independent artwork keys and translated titles/text. Regional prose is translated rather than Hindi transliteration. Native Gujarati and Kannada copy should receive editorial review before release.

`KidsStoryReaderScreen` uses the existing persisted reading-language context and language picker. Changing the locale keeps the current page index and artwork. Caption and optional dialogue render as native text below the image with natural height, script-specific fonts and the existing reading-size tokens. The page scrolls when a translation or accessibility font setting needs extra room; text is not baked into the image.

Artwork is bundled offline. Page 8 uses the approved muted pastel Yamuna illustration with stronger waves. The other nine pages retain the original prototype SVG placeholders; replace them with final illustrations in the approved style before release. The preview opens on page 8 to show the selected artwork. The story library uses this image as its cover preview.

Optional `dialogue` carries translated speaker/text fields. Optional `audio` can hold real locale-specific recording references in future; no audio controls are exposed until recordings and playback are implemented.

Prototype: `docs/kids-stories-prototype.html`. Same four-language story dataset and artwork as the native reader. It demonstrates changing language on page 8, previous/next navigation, the final takeaway and the library door. It is a browser preview; native screen/device testing is still required.

Validation: `npx tsx --test src/data/__tests__/kidsStories.test.ts` from `mobile/`. Check the reader on a small phone with large reading text in all four languages before release.
