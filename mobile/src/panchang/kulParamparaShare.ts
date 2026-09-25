/**
 * The device-controlled hand-off for the कुल परम्परा export (PRD-29 §3.7):
 * write the envelope to a cache file, open the OS share sheet, done. No cloud,
 * no upload target, no prompt — sharing is the user's decision. The full
 * PRD-06 backup (`src/backup/`, design.md §75) has since landed and carries
 * the same record with everything else; this narrower file stays as the
 * give-it-to-a-relative path, and the restore screen recognises its `format`
 * so it is named, not rejected as garbage.
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
