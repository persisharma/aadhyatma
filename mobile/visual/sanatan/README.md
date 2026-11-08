# Sanatan native-component layout preview

This harness imports the actual Home card, collection and reader components from `mobile/src`. It adapts native-only platform APIs for browser layout inspection; it is not another product or a replacement implementation.

From `mobile`, install the harness dependencies in `visual/sanatan` and run `node visual/sanatan/build.mjs`, then serve its `dist` folder locally. Query parameters: `lang=hi|en|gu|kn`, `size=M|L`, `width=320|390`, `system=1|1.5`. Use `view=home`, `view=reader&topic=symbols&page=1`, or the default hub; collection/reader navigation uses the native screen code.

`view=home` displays the actual Kids Stories and Sanatan banners together to
inspect their shared shell, bilingual titles, artwork framing and spacing. The
browser adapter uses the story-cover placeholder by default; `cdn=1` opts into
the request URL when reachable. Native caching is not simulated.

Audio, share and native storage integration are not verified by this harness. Passing this browser review does not establish iOS/Android image/font/layout acceptance. The PR remains draft until the device matrix is recorded.
