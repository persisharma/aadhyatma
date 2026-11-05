# First-run widget order — owner correction

The latest approved order supersedes the language-Continue trigger in the earlier PR #617 documentation:

Language → city → widget setup → reminders → tour.

City Continue commits the selected city before starting the preselected Verse/Panchang pin flow. No separate Vedansh prompt or Add button. Android retains launcher confirmations and persists step 3 (reminders) before handing off. iPhone reuses inline widget instructions; Continue/Not now goes to reminders and Back goes to city. Initial hydration runs once so a city update cannot reload stale step state.

28 focused Jest tests pass. Full CI, native Maestro and four-language/size/device/launcher visual verification remain pending. The large design.md/RULEBOOK documentation mirrors still need synchronization; keep draft until complete. No build, OTA, merge or release.
