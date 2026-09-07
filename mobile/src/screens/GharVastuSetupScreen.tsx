/**
 * मेरा घर setup (PRD-24 Phase 2 §C1/§E2, design.md §66.4) — three skippable
 * steps: type + room counts + label → facing (from the brochure or memory;
 * the compass Hold capture arrives with R1) → मंडल-ग्रिड placement.
 *
 * Placement is DRAG-first (UX decision 2026-09-06): pick a room chip up and
 * drop it into the cell the room mostly sits in; the chip rests where it is
 * dropped (`at` — a sketch, never a finding input). A placed chip drags to
 * another cell to move, or back to the tray to clear. Tap-chip-then-tap-cell
 * does the same without a drag (assistive input). The record saves after
 * every capture — a broker's interruption never loses progress.
 *
 * Copy is instruction, never evaluation — chips stay neutral here; the
 * finding classes appear only on the assessment (RULEBOOK §22).
 */
import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderHandlers,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import VastuMandalaGrid, { type MandalaGridChip } from '@/components/VastuMandalaGrid';
import { useGitaLanguage } from '@/data/gita/language';
import { HOME_TEMPLATES, getHomeTemplate, resolveTemplateSeeds } from '@/data/vastu/homeTemplates';
import { getVastuRoomEntries, getVastuRoomEntry } from '@/data/vastu/roomGuidance';
import type { VastuZone } from '@/data/vastu/types';
import { DISHA_LABELS, DISHA_ORDER, type DishaDirection } from '@/panchang/eventMuhurat';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { HomePlacement, HomeRecord, HomeRole } from '@/vastu/homeRecord';
import { getHomeRosterSnapshot, loadHomeRoster, saveHome } from '@/vastu/homeRecordStore';

type Navigation = {
  goBack: () => void;
  replace: (route: string, params?: object) => void;
};

type Route = { params?: { homeId?: string; role?: HomeRole } };

const placementKey = (p: { roomId: string; ordinal: number }) => `${p.roomId}-${p.ordinal}`;

// Session-unique id: creation timestamp + a monotone counter (no randomness —
// the timestamp is user data the record carries anyway).
let homeIdCounter = 0;
const nextHomeId = () => `home-${Date.now().toString(36)}-${(homeIdCounter += 1)}`;

function seedRooms(templateId: string): HomePlacement[] {
  return resolveTemplateSeeds(templateId).map(({ entry, ordinal }) => ({
    roomId: entry.id,
    ordinal,
    zone: null,
    via: null,
    recordedAt: null,
  }));
}

function newDraft(role: HomeRole = 'considering'): HomeRecord {
  const now = new Date().toISOString();
  return {
    id: nextHomeId(),
    version: 1,
    label: '',
    kind: 'flat',
    template: 'flat-3bhk',
    role,
    facing: null,
    rooms: seedRooms('flat-3bhk'),
    createdAt: now,
    updatedAt: now,
  };
}

export default function GharVastuSetupScreen({ navigation, route }: { navigation: Navigation; route: Route }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const [draft, setDraft] = useState<HomeRecord>(() => {
    const existing = route.params?.homeId
      ? getHomeRosterSnapshot().roster.homes.find((h) => h.id === route.params?.homeId)
      : undefined;
    return existing ? { ...existing, rooms: [...existing.rooms] } : newDraft(route.params?.role);
  });
  const [step, setStep] = useState(route.params?.homeId ? 2 : 0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // ——— drag state (ghost chip follows the finger; state churn kept off the move path)
  const ghostPos = useRef(new Animated.ValueXY({ x: -999, y: -999 })).current;
  const [ghost, setGhost] = useState<{ key: string; label: string } | null>(null);
  const [hoverZone, setHoverZone] = useState<VastuZone | null>(null);
  const hoverZoneRef = useRef<VastuZone | null>(null);
  const overlayRef = useRef<View>(null);
  const gridRef = useRef<View>(null);
  const trayRef = useRef<View>(null);
  const rects = useRef<{ overlay?: number[]; grid?: number[]; tray?: number[] }>({});

  const persist = (next: HomeRecord) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setDraft(stamped);
    void loadHomeRoster().then(() => saveHome(stamped));
  };

  const mutatePlacement = (key: string, change: Partial<HomePlacement>) => {
    persist({
      ...draft,
      rooms: draft.rooms.map((p) => (placementKey(p) === key ? { ...p, ...change } : p)),
    });
  };

  const placeRoom = (key: string, zone: VastuZone, at?: { fx: number; fy: number }) => {
    mutatePlacement(key, {
      zone,
      via: 'manual',
      recordedAt: new Date().toISOString(),
      ...(at ? { at } : { at: undefined }),
    });
    setSelectedKey(null);
  };

  const clearRoom = (key: string) => {
    mutatePlacement(key, { zone: null, via: null, recordedAt: null, at: undefined });
    setSelectedKey(null);
  };

  // ——— geometry: cells are computable from the grid rect (uniform 3×3).
  const zoneAt = (pageX: number, pageY: number): { zone: VastuZone; fx: number; fy: number } | null => {
    const grid = rects.current.grid;
    if (!grid) return null;
    const [gx, gy, gw, gh] = grid;
    if (pageX < gx || pageY < gy || pageX > gx + gw || pageY > gy + gh) return null;
    const col = Math.min(2, Math.floor(((pageX - gx) / gw) * 3));
    const row = Math.min(2, Math.floor(((pageY - gy) / gh) * 3));
    const cellW = gw / 3;
    const cellH = gh / 3;
    const grid3: readonly (readonly VastuZone[])[] = [
      ['northwest', 'north', 'northeast'],
      ['west', 'center', 'east'],
      ['southwest', 'south', 'southeast'],
    ];
    return {
      zone: grid3[row][col],
      fx: (pageX - gx - col * cellW) / cellW,
      fy: (pageY - gy - row * cellH) / cellH,
    };
  };

  const overTray = (pageX: number, pageY: number): boolean => {
    const tray = rects.current.tray;
    if (!tray) return false;
    const [tx, ty, tw, th] = tray;
    return pageX >= tx && pageY >= ty && pageX <= tx + tw && pageY <= ty + th;
  };

  const measureAll = () => {
    overlayRef.current?.measureInWindow((x, y, w, h) => (rects.current.overlay = [x, y, w, h]));
    gridRef.current?.measureInWindow((x, y, w, h) => (rects.current.grid = [x, y, w, h]));
    trayRef.current?.measureInWindow((x, y, w, h) => (rects.current.tray = [x, y, w, h]));
  };

  const dragHandlers = (key: string, label: string, placed: boolean): GestureResponderHandlers =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        measureAll();
        const { pageX, pageY } = e.nativeEvent;
        const overlay = rects.current.overlay ?? [0, 0, 0, 0];
        ghostPos.setValue({ x: pageX - overlay[0] - 34, y: pageY - overlay[1] - 40 });
        setGhost({ key, label });
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        const overlay = rects.current.overlay ?? [0, 0, 0, 0];
        ghostPos.setValue({ x: pageX - overlay[0] - 34, y: pageY - overlay[1] - 40 });
        const hit = zoneAt(pageX, pageY);
        const zone = hit ? hit.zone : null;
        if (hoverZoneRef.current !== zone) {
          hoverZoneRef.current = zone;
          setHoverZone(zone);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        const { pageX, pageY } = e.nativeEvent;
        setGhost(null);
        hoverZoneRef.current = null;
        setHoverZone(null);
        const moved = Math.hypot(gesture.dx, gesture.dy) >= 8;
        if (!moved) {
          // A plain tap selects the chip for the tap-a-cell path.
          setSelectedKey((current) => (current === key ? null : key));
          return;
        }
        const hit = zoneAt(pageX, pageY);
        if (hit) {
          placeRoom(key, hit.zone, { fx: hit.fx, fy: hit.fy });
        } else if (placed && overTray(pageX, pageY)) {
          clearRoom(key);
        }
      },
      onPanResponderTerminate: () => {
        setGhost(null);
        hoverZoneRef.current = null;
        setHoverZone(null);
      },
    }).panHandlers;

  // ——— derived
  const roomLabel = (p: { roomId: string; ordinal: number }): string => {
    const entry = getVastuRoomEntry(p.roomId);
    const title = entry ? contentByLang(lang, entry.titleHi, entry.titleEn) : p.roomId;
    return p.ordinal > 1 ? `${title} ${p.ordinal}` : title;
  };

  const placeable = draft.rooms.filter((p) => p.roomId !== 'main-door');
  const placedCount = draft.rooms.filter((p) => p.zone != null).length;
  const nextUnplaced = placeable.find((p) => p.zone == null);
  const effectiveSelected = selectedKey ?? (nextUnplaced ? placementKey(nextUnplaced) : null);

  const gridChips: MandalaGridChip[] = placeable
    .filter((p) => p.zone != null)
    .map((p) => ({
      key: placementKey(p),
      label: roomLabel(p),
      zone: p.zone as VastuZone,
      at: p.at,
      selected: effectiveSelected === placementKey(p),
    }));

  const onPressCell = (zone: VastuZone) => {
    if (!effectiveSelected) return;
    placeRoom(effectiveSelected, zone);
  };

  const stepTitle = [
    contentByLang(lang, 'घर का प्रकार', 'Home type'),
    contentByLang(lang, 'घर का मुख', 'Facing'),
    contentByLang(lang, 'मंडल पर रखें', 'Place on the mandala'),
  ][step];

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  };

  const chipStyle = (active: boolean) => [
    styles.chip,
    {
      borderColor: active ? colors.cardActiveBorder : colors.border,
      backgroundColor: active ? colors.goldChipBg : colors.surface,
      borderRadius: radii.pill,
    },
  ];
  const chipTextStyle = (active: boolean) => ({
    fontFamily: titleFont,
    fontSize: 12,
    lineHeight: 19,
    color: active ? colors.saffronDeep : colors.inkSoft,
  });

  // ——— step 0: type, counts, label
  const changeTemplate = (templateId: string) => {
    const template = getHomeTemplate(templateId);
    if (!template) return;
    persist({ ...draft, template: templateId, kind: template.kind, rooms: seedRooms(templateId) });
  };

  const countOf = (roomId: string) => draft.rooms.filter((p) => p.roomId === roomId).length;

  const changeCount = (roomId: string, delta: number) => {
    const current = countOf(roomId);
    const min = roomId === 'main-door' ? 1 : 0;
    if (delta > 0 && current < 6) {
      persist({
        ...draft,
        rooms: [...draft.rooms, { roomId, ordinal: current + 1, zone: null, via: null, recordedAt: null }],
      });
    } else if (delta < 0 && current > min) {
      // Remove the last (preferring an unplaced) chip of this room.
      const candidates = draft.rooms.filter((p) => p.roomId === roomId);
      const toDrop = [...candidates].reverse().find((p) => p.zone == null) ?? candidates[candidates.length - 1];
      persist({ ...draft, rooms: draft.rooms.filter((p) => p !== toDrop) });
    }
  };

  const setFacing = (dik: DishaDirection) => {
    persist({
      ...draft,
      facing: dik,
      rooms: draft.rooms.map((p) =>
        p.roomId === 'main-door'
          ? { ...p, zone: dik, via: 'manual', recordedAt: new Date().toISOString(), at: undefined }
          : p
      ),
    });
  };

  const finish = () => {
    const label =
      draft.label.trim() ||
      contentByLang(lang, draft.role === 'living' ? 'हमारा घर' : 'देखा गया घर', draft.role === 'living' ? 'Our home' : 'A home we saw');
    const finished = { ...draft, label, updatedAt: new Date().toISOString() };
    void loadHomeRoster().then(() => saveHome(finished));
    navigation.replace('GharVastu', { homeId: draft.id });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-setup-screen">
      <ReaderHeader
        title={contentByLang(lang, 'नया घर', 'New home')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <View ref={overlayRef} collapsable={false} style={{ flex: 1 }}>
        <ScrollView
          scrollEnabled={ghost == null}
          contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}
        >
          {/* step indicator */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? colors.saffron : colors.divider }}
              />
            ))}
          </View>
          <Text style={{ fontFamily: titleFont, fontSize: 17, lineHeight: 26, color: colors.ink, marginTop: spacing.md }}>
            {stepTitle}
          </Text>

          {step === 0 ? (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'यह घर', 'This home')}</Text>
              <View style={styles.chipRow}>
                {(
                  [
                    ['living', contentByLang(lang, 'यहाँ रहते हैं', 'We live here')],
                    ['considering', contentByLang(lang, 'देख रहे हैं · खरीद/किराया', 'Viewing · buy/rent')],
                  ] as [HomeRole, string][]
                ).map(([role, label]) => (
                  <Pressable
                    key={role}
                    testID={`ghar-role-${role}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: draft.role === role }}
                    accessibilityLabel={role === 'living' ? 'We live here' : 'Viewing to buy or rent'}
                    onPress={() => persist({ ...draft, role })}
                    style={chipStyle(draft.role === role)}
                  >
                    <Text style={chipTextStyle(draft.role === role)}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={sectionLabelStyle}>{contentByLang(lang, 'घर का प्रकार', 'Home type')}</Text>
              <View style={styles.chipRow}>
                {HOME_TEMPLATES.map((template) => (
                  <Pressable
                    key={template.id}
                    testID={`ghar-template-${template.id}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: draft.template === template.id }}
                    accessibilityLabel={`Template ${template.labelEn}`}
                    onPress={() => changeTemplate(template.id)}
                    style={chipStyle(draft.template === template.id)}
                  >
                    <Text style={chipTextStyle(draft.template === template.id)}>
                      {contentByLang(lang, template.labelHi, template.labelEn)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={sectionLabelStyle}>{contentByLang(lang, 'कक्ष गिनती', 'Room counts')}</Text>
              <View style={{ gap: 6 }}>
                {getVastuRoomEntries()
                  .filter((entry) => !entry.isCenter)
                  .map((entry) => {
                    const fixed = entry.id === 'main-door';
                    const count = countOf(entry.id);
                    return (
                      <View key={entry.id} style={[styles.countRow, { borderColor: colors.divider }]}>
                        <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 13.5, lineHeight: 20, color: colors.ink }}>
                          {contentByLang(lang, entry.titleHi, entry.titleEn)}
                        </Text>
                        {fixed ? (
                          <Text style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted }}>
                            {contentByLang(lang, '1 · सदैव', '1 · always')}
                          </Text>
                        ) : (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                            <Pressable
                              testID={`ghar-count-minus-${entry.id}`}
                              accessibilityRole="button"
                              accessibilityLabel={`Remove one ${entry.titleEn}`}
                              onPress={() => changeCount(entry.id, -1)}
                              hitSlop={8}
                            >
                              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 18, color: colors.saffronDeep }}>−</Text>
                            </Pressable>
                            <Text
                              testID={`ghar-count-${entry.id}`}
                              style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, minWidth: 16, textAlign: 'center' }}
                            >
                              {count}
                            </Text>
                            <Pressable
                              testID={`ghar-count-plus-${entry.id}`}
                              accessibilityRole="button"
                              accessibilityLabel={`Add one ${entry.titleEn}`}
                              onPress={() => changeCount(entry.id, 1)}
                              hitSlop={8}
                            >
                              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 18, color: colors.saffronDeep }}>+</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>

              <Text style={sectionLabelStyle}>{contentByLang(lang, 'नाम', 'Label')}</Text>
              <TextInput
                testID="ghar-label-input"
                value={draft.label}
                onChangeText={(label) => setDraft({ ...draft, label })}
                onEndEditing={() => persist(draft)}
                placeholder={contentByLang(lang, 'जैसे — Prestige 3BHK, 7वाँ तल', 'e.g. Prestige 3BHK, 7th floor')}
                placeholderTextColor={colors.inkMuted}
                style={[
                  styles.input,
                  { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, color: colors.ink, fontFamily: bodyFont, borderRadius: radii.sm },
                ]}
              />

              <Pressable
                testID="ghar-setup-next-type"
                accessibilityRole="button"
                accessibilityLabel="Next, facing"
                onPress={() => setStep(1)}
                style={[styles.primaryButton, { backgroundColor: colors.saffron, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: 20, color: '#FFF8EC' }}>
                  {contentByLang(lang, 'आगे · मुख ›', 'Next · facing ›')}
                </Text>
              </Pressable>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: spacing.sm }}>
                {meaningByLang(
                  lang,
                  'घर किस दिशा की ओर देखता है? ब्रोशर में लिखा होता है; द्वार के भीतर खड़े होकर बाहर देखने की दिशा भी यही है।',
                  'Which way does the home face? Brochures state it; standing inside the main door looking out is the same direction.'
                )}
              </Text>
              <View style={[styles.chipRow, { justifyContent: 'center', marginTop: spacing.md }]}>
                {DISHA_ORDER.map((dik) => (
                  <Pressable
                    key={dik}
                    testID={`ghar-facing-${dik}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: draft.facing === dik }}
                    accessibilityLabel={`Facing ${DISHA_LABELS[dik].en}`}
                    onPress={() => setFacing(dik)}
                    style={chipStyle(draft.facing === dik)}
                  >
                    <Text style={chipTextStyle(draft.facing === dik)}>
                      {contentByLang(lang, DISHA_LABELS[dik].hi, DISHA_LABELS[dik].en)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.stepNav}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to type"
                  onPress={() => setStep(0)}
                  style={[styles.secondaryButton, { borderColor: colors.cardActiveBorder, borderRadius: radii.pill }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                    {contentByLang(lang, '‹ प्रकार', '‹ Type')}
                  </Text>
                </Pressable>
                <Pressable
                  testID="ghar-setup-next-facing"
                  accessibilityRole="button"
                  accessibilityLabel="Next, place rooms"
                  disabled={draft.facing == null}
                  onPress={() => setStep(2)}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.saffron, borderRadius: radii.pill, opacity: draft.facing == null ? 0.45 : 1, marginTop: 0 },
                  ]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: 20, color: '#FFF8EC' }}>
                    {contentByLang(lang, 'आगे · कक्ष ›', 'Next · rooms ›')}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: spacing.sm }}>
                {meaningByLang(
                  lang,
                  'उत्तर ऊपर है — ब्रोशर की तरह। कक्ष का चिप उठाकर उस खाने में छोड़ें जहाँ वह अधिकतर है; खाने के भीतर जहाँ छोड़ेंगे, वहीं टिकेगा। बीच का खाना ब्रह्मस्थान है।',
                  'North is up, like a brochure. Drag a room chip into the cell the room mostly sits in — it rests where you drop it. The middle cell is the ब्रह्मस्थान.'
                )}
              </Text>
              <View ref={gridRef} collapsable={false} style={{ marginTop: spacing.md }}>
                <VastuMandalaGrid
                  chips={gridChips}
                  facing={draft.facing}
                  hoverZone={hoverZone}
                  onPressCell={onPressCell}
                  chipHandlers={(key) => {
                    const placement = draft.rooms.find((p) => placementKey(p) === key);
                    return dragHandlers(key, placement ? roomLabel(placement) : key, true);
                  }}
                  accessibilityLabel={contentByLang(
                    lang,
                    `मंडल — ${placedCount} कक्ष रखे गए`,
                    `Mandala — ${placedCount} rooms placed`
                  )}
                />
              </View>

              <Text style={sectionLabelStyle}>
                {contentByLang(lang, 'कक्ष — चिप उठाएँ, खाने में छोड़ें', 'Rooms — pick a chip, drop it in a cell')}
              </Text>
              <View ref={trayRef} collapsable={false} style={styles.chipRow} testID="ghar-room-tray">
                {draft.rooms.map((p) => {
                  const key = placementKey(p);
                  const done = p.zone != null;
                  const isDoor = p.roomId === 'main-door';
                  const active = effectiveSelected === key;
                  const zoneText = done
                    ? p.zone === 'center'
                      ? contentByLang(lang, 'ब्रह्मस्थान', 'Centre')
                      : contentByLang(lang, DISHA_LABELS[p.zone as DishaDirection].hi, DISHA_LABELS[p.zone as DishaDirection].en)
                    : null;
                  if (isDoor) {
                    return (
                      <View
                        key={key}
                        testID={`ghar-room-${key}`}
                        style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.goldChipBg, borderRadius: radii.pill, opacity: 0.9 }]}
                      >
                        <Text style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 19, color: colors.saffronDeep }}>
                          {`✓ ${roomLabel(p)}`}
                          <Text style={{ fontSize: 10.5, color: colors.inkMuted }}>
                            {zoneText ? `  ${zoneText} · ${contentByLang(lang, 'मुख से', 'from facing')}` : ''}
                          </Text>
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View
                      key={key}
                      testID={`ghar-room-${key}`}
                      accessible
                      accessibilityLabel={`Room chip ${roomLabel(p)}${done ? `, placed ${p.zone}` : ', not placed'}`}
                      {...dragHandlers(key, roomLabel(p), done)}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? colors.saffronDeep : done ? colors.cardActiveBorder : colors.border,
                          backgroundColor: done ? colors.goldChipBg : colors.surface,
                          borderRadius: radii.pill,
                          opacity: ghost?.key === key ? 0.35 : 1,
                        },
                      ]}
                    >
                      <Text style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 19, color: done ? colors.saffronDeep : colors.inkSoft }}>
                        {done ? `✓ ${roomLabel(p)}` : roomLabel(p)}
                        {zoneText ? <Text style={{ fontSize: 10.5, color: colors.inkMuted }}>{`  ${zoneText}`}</Text> : null}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: spacing.sm }}>
                {meaningByLang(
                  lang,
                  'रखा चिप दूसरे खाने में खींचा जा सकता है; सूची में वापस खींचने से हट जाता है। खाने के भीतर की जगह केवल आपका रेखाचित्र है — पाठ नौ क्षेत्रों से ही आता है। हर छोड़ के बाद रिकॉर्ड सुरक्षित।',
                  'Drag a placed chip to another cell to move it, or back to this list to clear it. Where it sits inside a cell is only your sketch — the reading comes from the nine zones alone. The record saves after every drop.'
                )}
              </Text>

              <View style={styles.stepNav}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to facing"
                  onPress={() => setStep(1)}
                  style={[styles.secondaryButton, { borderColor: colors.cardActiveBorder, borderRadius: radii.pill }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                    {contentByLang(lang, '‹ मुख', '‹ Facing')}
                  </Text>
                </Pressable>
                <Pressable
                  testID="ghar-setup-finish"
                  accessibilityRole="button"
                  accessibilityLabel="See the assessment"
                  disabled={placedCount < 2}
                  onPress={finish}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.saffron, borderRadius: radii.pill, opacity: placedCount < 2 ? 0.45 : 1, marginTop: 0 },
                  ]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: 20, color: '#FFF8EC' }}>
                    {contentByLang(lang, 'सारांश देखें ›', 'See the assessment ›')}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* the ghost chip that follows the finger */}
        {ghost ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ghost,
              {
                backgroundColor: colors.goldChipBg,
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.pill,
                transform: ghostPos.getTranslateTransform(),
              },
            ]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 12, lineHeight: 19, color: colors.saffronDeep }}>{ghost.label}</Text>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 5 },
  countRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 8, gap: 8 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  primaryButton: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 9, marginTop: 22 },
  secondaryButton: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  stepNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 },
  ghost: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    elevation: 6,
    shadowColor: '#3C1E0A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 20,
  },
});
