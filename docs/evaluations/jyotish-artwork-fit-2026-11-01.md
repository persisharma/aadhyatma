# Jyotish landing artwork fit

The four illustrated landing doors use a View-owned 3:2 frame: 100% width in the two-column gallery and 36% width in the horizontal Large/narrow-screen cards. Decorative images fill that frame with explicit 100% width and height, avoiding React Native's intrinsic bundled-image dimensions. Header, education and prayer artwork use the same frame separation.

Validation from the implementation session: all 13 gallery Jest tests passed, including Hindi, English, Gujarati and Kannada at Standard/Large, narrow-screen/system-scale reflow, saved-state actions and image-frame regression checks. Changed-source ESLint passed. Full typecheck was blocked by missing/incomplete unrelated artwork manifests in the partial checkout. No native simulator/device verification was available.

Canonical design.md section 51c synchronization remains pending: automatic approval review rejected inclusion of the full existing document in the public repository. This focused note records only the sizing change.
