/**
 * Vālmīki Rāmāyaṇa verse page.
 *
 * `ValmikiRamayanVerse` is a superset of the `lines` + `linesEn` archetype that
 * `SundarkandVersePage` renders, so the rendering is re-exported rather than
 * duplicated. The explicit re-export (rather than the reader importing another
 * section's page directly) is required by RULEBOOK §2 row 4 / §3 *Type safety on
 * verse pages*: the dependency stays visible, so a future shape change to either
 * section breaks here rather than at runtime.
 */
export { default } from './SundarkandVersePage';
