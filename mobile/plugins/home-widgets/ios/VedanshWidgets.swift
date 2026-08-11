import WidgetKit
import SwiftUI

private let appGroup = "group.com.prashantsharma.vedansh.widgets"
private let payloadName = "widget-payload-v1.json"

// One reviewed mapping of the app's theme tokens (design.md §2) into the widget
// target, so a token value lives in exactly one place instead of scattered RGB
// literals that drift shade-by-shade (PRD-15 §9).
enum WidgetTheme {
  static let parchment = Color(red: 0.97, green: 0.94, blue: 0.84)   // colors.parchment
  static let saffronDeep = Color(red: 0.48, green: 0.22, blue: 0.13) // colors.saffronDeep
  static let gold = Color(red: 0.65, green: 0.49, blue: 0.20)        // colors.gold
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

enum VedanshSurface: Equatable { case ambient, japam }

struct VedanshWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: VedanshEntry
  let surface: VedanshSurface
  var body: some View {
    Group {
      switch entry.state {
      case .ready(let payload): surface == .japam ? AnyView(japam(payload)) : AnyView(ambient(payload))
      case .expired: recovery("पंचांग ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh")
      case .missing, .invalid: recovery("विजेट तैयार करने हेतु वेदांश़ खोलें", "Open Vedansh to prepare widgets")
      }
    }.vedanshWidgetBackground()
  }

  @ViewBuilder private func ambient(_ payload: WidgetPayload) -> some View {
    let pKey = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    let vKey = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
    let lang = payload.locale
    let p = payload.panchang.days.first(where: { $0.dateKey == pKey })
    let v = payload.verses.days.first(where: { $0.dateKey == vKey })
    if family == .accessoryInline {
      Text((p?.vrat?.value(lang) ?? p?.tithi.value(lang)) ?? "वेदांश़")
    } else if family == .systemMedium {
      if let p = p {
        VStack(alignment: .leading, spacing: 5) {
          Text("\(p.representedDate.value(lang)) · \(payload.panchang.cityLabel.value(lang))").font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep)
          Text(p.tithi.value(lang)).font(.custom(fontName(lang, bold: true), size: 21)).lineLimit(1)
          if let vrat = p.vrat { Text(vrat.value(lang)).font(.custom(fontName(lang, bold: false), size: 12)).lineLimit(1) }
          Text("\(p.sunrise.value(lang))   \(p.rahuKaal.value(lang))").font(.system(size: 10, weight: .semibold)).lineLimit(1)
          brand()
        }.widgetURL(URL(string: p.deepLink)).accessibilityElement(children: .combine)
      } else { recovery("पंचांग ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh") }
    } else if let v = v {
      VStack(alignment: .leading, spacing: 7) {
        Text(lang == "en" ? "TODAY'S VERSE" : "आज का श्लोक").font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep)
        Text(v.excerpt.value(lang)).font(.custom(fontName(lang, bold: false), size: 15)).lineLimit(2).minimumScaleFactor(0.85)
        Text(v.source.value(lang)).font(.system(size: 10, weight: .semibold)).foregroundStyle(.secondary).lineLimit(1)
        brand()
      }.widgetURL(URL(string: v.deepLink)).accessibilityLabel(v.accessibilityLabel.value(lang))
    } else { recovery("विजेट ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh") }
  }

  @ViewBuilder private func japam(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: payload.japam.timeZone); let lang = payload.locale
    if payload.japam.dateKey != key {
      recovery("जप ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh Japam")
    } else if family == .accessoryCircular {
      VStack(spacing: 0) { Text("\(min(payload.japam.totalBeads, 108))").font(.headline); Text(lang == "en" ? "Japa" : "जप").font(.caption2) }
        .widgetURL(URL(string: payload.japam.deepLink)).accessibilityLabel("\(payload.japam.totalBeads) beads, \(payload.japam.japaStreak) Japam days")
    } else {
      VStack(alignment: .leading, spacing: 8) {
        Text(lang == "en" ? "JAPAM PRACTICE" : "जप-साधना").font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(WidgetTheme.saffronDeep)
        Text("\(payload.japam.totalBeads) / 108").font(.custom(fontName(lang, bold: true), size: 27))
        Text(lang == "en" ? "\(payload.japam.totalRounds) rounds · \(payload.japam.japaStreak) days" : "\(payload.japam.totalRounds) माला · \(payload.japam.japaStreak) जप-दिन").font(.system(size: 11, weight: .semibold)).foregroundStyle(.secondary)
        brand()
      }.widgetURL(URL(string: payload.japam.deepLink)).accessibilityElement(children: .combine)
    }
  }

  private func recovery(_ hi: String, _ en: String) -> some View {
    let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    return VStack(alignment: .leading, spacing: 8) { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 13)); Text(hi).font(.custom("NotoSerifDevanagari-Medium", size: 13)); Text(en).font(.system(size: 10, weight: .semibold)).foregroundStyle(.secondary) }
      .widgetURL(URL(string: "vedansh://widget/panchang?date=\(key)"))
  }
  private func brand() -> some View { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 10)).foregroundStyle(WidgetTheme.gold) }
  private func fontName(_ lang: String, bold: Bool) -> String { lang == "gu" ? (bold ? "NotoSerifGujarati-SemiBold" : "NotoSerifGujarati-Medium") : lang == "kn" ? (bold ? "NotoSerifKannada-SemiBold" : "NotoSerifKannada-Medium") : lang == "en" ? (bold ? "Inter-SemiBold" : "Inter-Medium") : (bold ? "NotoSerifDevanagari-SemiBold" : "NotoSerifDevanagari-Medium") }
}

struct VedanshAmbientWidget: Widget {
  let kind = "VedanshAmbientWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VedanshProvider()) { VedanshWidgetView(entry: $0, surface: .ambient) }
      .configurationDisplayName("Vedansh").description("Today’s verse and Panchang")
      .supportedFamilies([.systemSmall, .systemMedium, .accessoryInline])
  }
}

struct VedanshJapamWidget: Widget {
  let kind = "VedanshJapamWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: VedanshProvider()) { VedanshWidgetView(entry: $0, surface: .japam) }
      .configurationDisplayName("Vedansh Japam").description("Your current Japam practice")
      .supportedFamilies([.systemSmall, .accessoryCircular])
  }
}

@main struct VedanshWidgetBundle: WidgetBundle {
  var body: some Widget { VedanshAmbientWidget(); VedanshJapamWidget() }
}
