# Proposal 06 component preview

Install the existing locked preview dependencies with `npm ci --prefix visual/sanatan` from mobile, then `node visual/gita-jump/build.mjs`. Serve `visual/gita-jump/dist`. This imports the production picker; native-only APIs use the same browser adapters as the Sanatan harness. Test `lang=hi|en|gu|kn`, `size=M|L`, widths 320/390. It does not verify native keyboard, focus, glyph metrics, navigation, audio or safe areas. Those remain device acceptance requirements.
