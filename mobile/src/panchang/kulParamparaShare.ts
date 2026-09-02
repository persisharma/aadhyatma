/**
 * The device-controlled hand-off for the कुल परम्परा export (PRD-29 §3.7):
 * write the envelope to a cache file, open the OS share sheet, done. No cloud,
 * no upload target, no prompt — sharing is the user's decision. PRD-06's
 * backup path is still unbuilt (verified 2026-08-31), so this is the record's
 * own minimal path on deps already in the binary; the envelope is designed to
 * become a PRD-06 section verbatim when that lands.
 */
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** `vedansh-kul-parampara-2026-10-29.json` — legible in a Files app years later. */
export function kulParamparaExportFilename(now: Date): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `vedansh-kul-parampara-${y}-${m}-${d}.json`;
}

/** Returns false when the OS offers no share sheet; throws on a write failure. */
export async function shareKulParamparaFile(json: string, filename: string): Promise<boolean> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return false;
  const file = new File(Paths.cache, filename);
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Kul Parampara',
  });
  return true;
}
