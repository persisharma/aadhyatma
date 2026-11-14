import { Linking, Platform } from 'react-native';
import { lightColors } from '@/theme/colors';
import { loadRNShare } from '@/utils/multiShare';

/**
 * Direct hand-off to WhatsApp and Instagram (design.md §39.11).
 *
 * The share sheet's WhatsApp and Instagram rows used to open the OS share list, so the
 * reader had to find the app a second time. These helpers open the named app itself
 * through `react-native-share`'s `shareSingle`, already in the binary for the all-pages
 * rows (§39.6). Every helper resolves `false` when it cannot land in the app — module
 * absent, app not installed, OS refusal — and the caller then runs the unchanged OS
 * sheet path, so nothing regresses on an older binary.
 *
 * Platform truth (store build with `plugins/withShareTargetApps.js`):
 * - Android: WhatsApp (or WhatsApp Business) opens its chat picker with the image(s) and
 *   the caption; Instagram post opens Instagram's own Feed/Chats/Story chooser; Instagram
 *   story opens the story composer. Needs the manifest `<queries>` entries — without
 *   them Android hides the packages and every probe says "not installed".
 * - iOS: Instagram story uses the pasteboard + `instagram-stories://` hand-off (needs
 *   `instagram-stories` in `LSApplicationQueriesSchemes`). Instagram post is NOT direct:
 *   the save-to-Photos + `instagram://library?LocalIdentifier=` route (undocumented by
 *   Meta) opened Instagram on a different photo whenever Instagram could not see the new
 *   asset (Nov 2026 device test), and left a copy in Photos. iOS post therefore keeps the
 *   OS sheet, where Instagram's own extension shows the right card. WhatsApp has no
 *   public iOS API that takes an image straight into a chat, so iOS keeps the sheet too.
 */

/**
 * The Facebook App ID Instagram requires as the Stories `source_application` (Meta,
 * January 2023). It is a public identifier, not a credential; it mirrors
 * `META_APP_ID` in `plugins/metaTrackingConfig.js` and a test keeps the two equal.
 */
export const INSTAGRAM_SOURCE_APP_ID = '1128589089734962';

export const WHATSAPP_PACKAGE = 'com.whatsapp';
export const WHATSAPP_BUSINESS_PACKAGE = 'com.whatsapp.w4b';
export const INSTAGRAM_PACKAGE = 'com.instagram.android';
/** iOS probe URL; its scheme must be in `LSApplicationQueriesSchemes`. */
export const INSTAGRAM_STORIES_PROBE = 'instagram-stories://share';

/**
 * A hand-off still pending after this long releases the share lock instead of blocking
 * every later share in the session (a native call that never settles).
 */
export const DIRECT_SHARE_SETTLE_MS = 90_000;

export type InstagramFormat = 'post' | 'story';

/** The probed module; never throws (a stale binary, or a test double of multiShare). */
function rnShare(): ReturnType<typeof loadRNShare> {
  try {
    return loadRNShare();
  } catch {
    return null;
  }
}

async function packageVisible(packageName: string): Promise<boolean> {
  const mod = rnShare();
  if (!mod?.isPackageInstalled) return false;
  try {
    return (await mod.isPackageInstalled(packageName))?.isInstalled === true;
  } catch {
    return false;
  }
}

async function schemeOpens(url: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(url);
  } catch {
    return false;
  }
}

/** Resolves the hand-off, or `true` (handled, outcome unknown) once the guard elapses. */
function settle(handoff: Promise<unknown>): Promise<boolean> {
  return new Promise((resolve) => {
    const guard = setTimeout(() => resolve(true), DIRECT_SHARE_SETTLE_MS);
    handoff.then(
      () => { clearTimeout(guard); resolve(true); },
      () => { clearTimeout(guard); resolve(false); }
    );
  });
}

/** The `social` id of the WhatsApp a direct share would open, or null (iOS, absent, hidden). */
export async function whatsAppDirectSocial(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  const mod = rnShare();
  if (!mod?.shareSingle) return null;
  if (await packageVisible(WHATSAPP_PACKAGE)) return mod.Social?.WHATSAPP ?? 'whatsapp';
  if (await packageVisible(WHATSAPP_BUSINESS_PACKAGE)) return mod.Social?.WHATSAPPBUSINESS ?? 'whatsappbusiness';
  return null;
}

/** True when the WhatsApp row can open WhatsApp itself (the sheet shows the row only then). */
export async function isWhatsAppDirectAvailable(): Promise<boolean> {
  return (await whatsAppDirectSocial()) !== null;
}

/**
 * Every PNG + the caption straight into WhatsApp's chat picker. `false` → the caller
 * opens the OS sheet instead.
 */
export async function shareToWhatsApp(urls: readonly string[], message: string): Promise<boolean> {
  if (!urls.length) return false;
  const social = await whatsAppDirectSocial();
  const share = rnShare()?.shareSingle;
  if (!social || !share) return false;
  return settle(share({ social, urls: [...urls], type: 'image/png', message, failOnCancel: false }));
}

/** True when this binary can open Instagram itself for `format` (never an iOS post). */
export async function isInstagramDirectAvailable(format: InstagramFormat): Promise<boolean> {
  if (!rnShare()?.shareSingle) return false;
  if (Platform.OS === 'android') return packageVisible(INSTAGRAM_PACKAGE);
  if (Platform.OS === 'ios') return format === 'story' && schemeOpens(INSTAGRAM_STORIES_PROBE);
  return false;
}

/** The PNG straight into Instagram (story composer; Android feed chooser). `false` → OS sheet. */
export async function shareToInstagram(fileUri: string, format: InstagramFormat): Promise<boolean> {
  if (!(await isInstagramDirectAvailable(format))) return false;
  const mod = rnShare();
  const share = mod?.shareSingle;
  if (!share) return false;
  if (format === 'story') {
    // Letterbox bands (a card that is not exactly 9:16) take the card's own paper.
    const paper = lightColors.parchment;
    return settle(share({
      social: mod.Social?.INSTAGRAM_STORIES ?? 'instagramstories',
      appId: INSTAGRAM_SOURCE_APP_ID,
      backgroundImage: fileUri,
      backgroundTopColor: paper,
      backgroundBottomColor: paper,
    }));
  }
  return settle(share({ social: mod.Social?.INSTAGRAM ?? 'instagram', url: fileUri, type: 'image/png' }));
}
