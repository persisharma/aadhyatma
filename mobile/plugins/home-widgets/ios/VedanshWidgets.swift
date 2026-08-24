import WidgetKit
import SwiftUI

private let appGroup = "group.com.prashantsharma.vedansh.widgets"
private let payloadName = "widget-payload-v1.json"

// One reviewed mapping of the app's theme tokens (design.md §2) into the widget
// target, so a token value lives in exactly one place instead of scattered RGB
// literals that drift shade-by-shade (PRD-15 §9).
// The widget background is always the light parchment (containerBackground
// below), so text MUST NOT use SwiftUI's scheme-adaptive .primary/.secondary —
// those invert to light shades in dark mode and vanish on the fixed cream, and
// even in light mode .secondary renders a washed-out gray below AA on parchment.
// Every glyph therefore gets an explicit ink/inkMuted token here, matching the
// app tokens (colors.ts) and the in-app gallery preview.
enum WidgetTheme {
  static let parchment = Color(red: 0.973, green: 0.937, blue: 0.839) // colors.parchmentSoft #F8EFD6 (card surface, matches Android)
  static let ink = Color(red: 0.102, green: 0.055, blue: 0.012)       // colors.ink #1A0E03
  static let inkMuted = Color(red: 0.431, green: 0.322, blue: 0.188)  // colors.inkMuted #6E5230 (~5.9:1 on parchment)
  static let saffronDeep = Color(red: 0.541, green: 0.243, blue: 0.043) // colors.saffronDeep #8A3E0B
  static let gold = Color(red: 0.651, green: 0.486, blue: 0.204)      // colors.gold #A67C34
}

private extension View {
  @ViewBuilder func vedanshWidgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) { WidgetTheme.parchment }
    } else { background(WidgetTheme.parchment) }
  }
}

func readPayload(now: Date = Date()) -> PayloadState {
  guard let base = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup),
        let data = try? Data(contentsOf: base.appendingPathComponent(payloadName)) else { return .missing }
  return decodeWidgetPayload(data, now: now)
}

// Representative content from the bundled fixture (valid far into the future, so
// it decodes as .ready) for the add-widget gallery preview and the placeholder
// skeleton, so a user who hasn't opened the app yet sees a real-looking widget
// instead of the "Open Vedansh to prepare" recovery card.
func sampleState() -> PayloadState {
  guard let url = Bundle.main.url(forResource: "widget-payload-v1", withExtension: "json"),
        let data = try? Data(contentsOf: url) else { return .missing }
  return decodeWidgetPayload(data, now: Date())
}

struct VedanshEntry: TimelineEntry { let date: Date; let state: PayloadState }
struct VedanshProvider: TimelineProvider {
  func placeholder(in context: Context) -> VedanshEntry { VedanshEntry(date: Date(), state: sampleState()) }
  func getSnapshot(in context: Context, completion: @escaping (VedanshEntry) -> Void) {
    let real = readPayload()
    if case .ready = real { completion(VedanshEntry(date: Date(), state: real)) }
    else { completion(VedanshEntry(date: Date(), state: context.isPreview ? sampleState() : real)) }
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<VedanshEntry>) -> Void) {
    let now = Date(); let state = readPayload(now: now)
    guard case .ready(let payload) = state else {
      completion(Timeline(entries: [VedanshEntry(date: now, state: state)], policy: .after(now.addingTimeInterval(15 * 60)))); return
    }
    var dates = Set<Date>(); dates.insert(now)
    for day in payload.panchang.days {
      if let date = widgetDayFormatter(widgetIstTimeZone).date(from: day.dateKey)?.addingTimeInterval(60), date > now { dates.insert(date) }
    }
    for day in payload.verses.days {
      if let date = widgetDayFormatter(payload.verses.timeZone).date(from: day.dateKey)?.addingTimeInterval(60), date > now { dates.insert(date) }
    }
    var entries = dates.sorted().map { VedanshEntry(date: $0, state: .ready(payload)) }
    if let expiry = widgetPayloadExpiry(payload), expiry >= now {
      entries.append(VedanshEntry(date: expiry.addingTimeInterval(1), state: .expired))
    }
    entries.sort { $0.date < $1.date }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

// One content type per widget kind (design.md §59). The size is then the user's
// choice in the OS gallery — a shloka is offered wide/large first because it needs
// the line width, the Panchang is offered small first because a tithi headline is
// a glance, and every kind still renders every size it advertises.
enum VedanshSurface: Equatable { case verse, panchang, japam }

struct VedanshWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: VedanshEntry
  let surface: VedanshSurface
  var body: some View {
    Group {
      switch entry.state {
      case .ready(let payload):
        switch surface {
        case .verse: verse(payload)
        case .panchang: panchang(payload)
        case .japam: japam(payload)
        }
      case .expired: recovery("पंचांग ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh")
      case .missing, .invalid: recovery("विजेट तैयार करने हेतु वेदांश़ खोलें", "Open Vedansh to prepare widgets")
      }
    }.vedanshWidgetBackground()
  }

  // MARK: - आज का श्लोक
  // Large renders the verse line-by-line from `lines`; medium flows those same
  // lines across the three lines its cell budgets; only small falls back to the
  // planner's excerpt, whose character cap is sized for that square.
  //
  // Medium used to draw the excerpt too, and that was the "shloka cut with space
  // still on the card" bug: `twoLineExcerpt`'s 88-character cap is a small-cell
  // budget, so a two-line Gita shloka (~90 characters) lost its closing pada to
  // an ellipsis on a card whose third line sat empty. The full verse is in the
  // payload — the wide cell reads it, and lets SwiftUI shrink/truncate only when
  // the text genuinely overruns.
  @ViewBuilder private func verse(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
    let lang = payload.locale
    if let v = payload.verses.days.first(where: { $0.dateKey == key }) {
      VStack(alignment: .leading, spacing: family == .systemSmall ? 5 : 7) {
        eyebrowRow {
          Text(verseKicker(lang)).font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep).lineLimit(1)
        }
        if family == .systemLarge {
          VStack(alignment: .leading, spacing: 5) {
            ForEach(Array(v.lines.value(lang).prefix(8).enumerated()), id: \.offset) { item in
              Text(item.element).font(.custom(fontName(lang, bold: false), size: 18)).foregroundStyle(WidgetTheme.ink).lineLimit(2).minimumScaleFactor(0.8)
            }
          }
        } else if family == .systemSmall {
          Text(v.excerpt.value(lang))
            .font(.custom(fontName(lang, bold: false), size: 13))
            .foregroundStyle(WidgetTheme.ink)
            .lineLimit(4)
            .minimumScaleFactor(0.8)
        } else {
          Text(flowedVerse(v.lines.value(lang)))
            .font(.custom(fontName(lang, bold: false), size: 16))
            .foregroundStyle(WidgetTheme.ink)
            .lineLimit(3)
            .minimumScaleFactor(0.8)
        }
        if family != .systemSmall {
          Text(v.source.value(lang)).font(.system(size: 10, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted).lineLimit(1)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .widgetURL(URL(string: v.deepLink)).accessibilityLabel(v.accessibilityLabel.value(lang))
    } else { recovery("विजेट ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh") }
  }

  // MARK: - आज का पंचांग
  // Small is the glance (date, tithi, sunrise); medium adds Rahu Kaal on one line;
  // large gives every window its own labelled row, Abhijit included.
  @ViewBuilder private func panchang(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    let lang = payload.locale
    if let p = payload.panchang.days.first(where: { $0.dateKey == key }) {
      if family == .accessoryInline {
        Text(p.vrat?.value(lang) ?? p.tithi.value(lang))
      } else {
        VStack(alignment: .leading, spacing: family == .systemLarge ? 7 : 5) {
          eyebrowRow {
            Text("\(p.representedDate.value(lang)) · \(payload.panchang.cityLabel.value(lang))")
              .font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep)
              .lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(0.85)
          }
          Text(p.tithi.value(lang))
            .font(.custom(fontName(lang, bold: true), size: family == .systemLarge ? 32 : family == .systemSmall ? 20 : 21))
            .foregroundStyle(WidgetTheme.ink).lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(0.75)
          if let vrat = p.vrat {
            Text(vrat.value(lang)).font(.custom(fontName(lang, bold: false), size: 12)).foregroundStyle(WidgetTheme.inkMuted)
              .lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(0.85)
          }
          if family == .systemSmall {
            Text(p.sunrise.value(lang)).font(.system(size: 10, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted).lineLimit(1).minimumScaleFactor(0.8)
          } else if family == .systemLarge {
            VStack(alignment: .leading, spacing: 4) {
              Text(p.sunrise.value(lang)); Text(p.rahuKaal.value(lang))
              if let abhijit = p.abhijit { Text(abhijit.value(lang)) }
            }.font(.system(size: 13, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted)
          } else {
            Text("\(p.sunrise.value(lang))   \(p.rahuKaal.value(lang))").font(.system(size: 10, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted).lineLimit(1)
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .widgetURL(URL(string: p.deepLink)).accessibilityElement(children: .combine)
      }
    } else { recovery("पंचांग ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh") }
  }

  // MARK: - जप-साधना
  @ViewBuilder private func japam(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: payload.japam.timeZone); let lang = payload.locale
    if payload.japam.dateKey != key {
      recovery("जप ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh Japam")
    } else if family == .accessoryCircular {
      VStack(spacing: 0) { Text("\(min(payload.japam.totalBeads, 108))").font(.headline); Text(lang == "en" ? "Japa" : "जप").font(.caption2) }
        .widgetURL(URL(string: payload.japam.deepLink)).accessibilityLabel("\(payload.japam.totalBeads) beads, \(payload.japam.japaStreak) Japam days")
    } else {
      VStack(alignment: .leading, spacing: 8) {
        eyebrowRow {
          Text(japamKicker(lang)).font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep).lineLimit(1)
        }
        Text("\(payload.japam.totalBeads) / 108").font(.custom(fontName(lang, bold: true), size: family == .systemMedium ? 34 : 27)).foregroundStyle(WidgetTheme.ink)
        Text(lang == "en" ? "\(payload.japam.totalRounds) rounds · \(payload.japam.japaStreak) days" : "\(payload.japam.totalRounds) माला · \(payload.japam.japaStreak) जप-दिन").font(.system(size: 11, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .widgetURL(URL(string: payload.japam.deepLink)).accessibilityElement(children: .combine)
    }
  }

  private func recovery(_ hi: String, _ en: String) -> some View {
    let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    return VStack(alignment: .leading, spacing: 8) { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 13)).foregroundStyle(WidgetTheme.ink); Text(hi).font(.custom("NotoSerifDevanagari-Medium", size: 13)).foregroundStyle(WidgetTheme.ink); Text(en).font(.system(size: 10, weight: .semibold)).foregroundStyle(WidgetTheme.inkMuted) }
      .widgetURL(URL(string: "vedansh://widget/panchang?date=\(key)"))
  }
  // The eyebrow row: section label on the left, ॐ mark on the right.
  //
  // The mark used to sit on its own line at the foot of every card, and on a
  // widget that is four text lines tall that line is expensive — on the medium
  // verse cell it was a third of the shloka's body, so a verse that needed three
  // lines only ever got two of them at full size. Pairing it with the eyebrow
  // costs no height at all: both are 10 pt and the eyebrow never fills the width.
  // The mark is `fixedSize` so a long eyebrow (the Panchang's date · city) gives
  // ground first — it already carries `minimumScaleFactor`/`lineLimit(2)` for it.
  private func eyebrowRow<Content: View>(@ViewBuilder _ eyebrow: () -> Content) -> some View {
    HStack(alignment: .firstTextBaseline, spacing: 6) {
      eyebrow()
      Spacer(minLength: 6)
      brand().fixedSize()
    }
  }
  private func brand() -> some View { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 10)).foregroundStyle(WidgetTheme.gold) }
  // The verse as one flowing paragraph, padas separated the way the planner's
  // excerpt separates them, so the wide cell keeps the shipped look while the
  // text wraps to whatever line count the cell actually has.
  private func flowedVerse(_ lines: [String]) -> String {
    lines.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: " · ")
  }
  // Section eyebrows are the one piece of widget copy the payload does not carry,
  // so they are localized here in the same four languages (gu/kn used to fall back
  // to Devanagari inside a Gujarati/Kannada widget).
  private func verseKicker(_ lang: String) -> String { lang == "en" ? "TODAY'S VERSE" : lang == "gu" ? "આજનો શ્લોક" : lang == "kn" ? "ಇಂದಿನ ಶ್ಲೋಕ" : "आज का श्लोक" }
  private func japamKicker(_ lang: String) -> String { lang == "en" ? "JAPAM PRACTICE" : lang == "gu" ? "જપ સાધના" : lang == "kn" ? "ಜಪ ಸಾಧನೆ" : "जप-साधना" }
  private func fontName(_ lang: String, bold: Bool) -> String { lang == "gu" ? (bold ? "NotoSerifGujarati-SemiBold" : "NotoSerifGujarati-Medium") : lang == "kn" ? (bold ? "NotoSerifKannada-SemiBold" : "NotoSerifKannada-Medium") : lang == "en" ? (bold ? "Inter-SemiBold" : "Inter-Medium") : (bold ? "NotoSerifDevanagari-SemiBold" : "NotoSerifDevanagari-Medium") }
}

struct VedanshVerseWidget: Widget {
  let kind = "VedanshVerseWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VedanshProvider()) { VedanshWidgetView(entry: $0, surface: .verse) }
      .configurationDisplayName("Vedansh · Verse")
      .description("आज का श्लोक — today’s verse. Wide or Large fits the whole shloka.")
      .supportedFamilies([.systemMedium, .systemLarge, .systemSmall])
  }
}

struct VedanshPanchangWidget: Widget {
  let kind = "VedanshPanchangWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VedanshProvider()) { VedanshWidgetView(entry: $0, surface: .panchang) }
      .configurationDisplayName("Vedansh · Panchang")
      .description("आज का पंचांग — tithi, sunrise and Rahu Kaal for the day.")
      .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryInline])
  }
}

struct VedanshJapamWidget: Widget {
  let kind = "VedanshJapamWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VedanshProvider()) { VedanshWidgetView(entry: $0, surface: .japam) }
      .configurationDisplayName("Vedansh · Japam").description("Your current Japam practice")
      .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
  }
}

@main struct VedanshWidgetBundle: WidgetBundle {
  var body: some Widget { VedanshVerseWidget(); VedanshPanchangWidget(); VedanshJapamWidget() }
}
