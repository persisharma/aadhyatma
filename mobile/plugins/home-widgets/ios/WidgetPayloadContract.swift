import Foundation

let widgetSupportedSchema = 1
let widgetIstTimeZone = "Asia/Kolkata"
let widgetLanguages = ["hi", "en", "gu", "kn"]

struct LocalizedText: Codable {
  let hi: String; let en: String; let gu: String; let kn: String
  func value(_ locale: String) -> String { locale == "en" ? en : locale == "gu" ? gu : locale == "kn" ? kn : hi }
}
struct LocalizedLines: Codable {
  let hi: [String]; let en: [String]; let gu: [String]; let kn: [String]
  func value(_ locale: String) -> [String] { locale == "en" ? en : locale == "gu" ? gu : locale == "kn" ? kn : hi }
}
struct VerseDay: Codable { let dateKey, sourceId: String; let artKey: String?; let chapter: Int?; let verseIndex: Int; let lines: LocalizedLines; let excerpt, source, accessibilityLabel: LocalizedText; let deepLink: String }
struct VerseSlice: Codable { let timeZone, validThrough: String; let days: [VerseDay] }
/// One link of the day's tithi chain (contract.ts `PanchangWidgetTithi`), in
/// order, link 0 always the sunrise tithi `PanchangDay.tithi` names. Optional
/// end: the last link's end belongs to tomorrow's solve, never a guess.
struct PanchangTithi: Codable { let name: LocalizedText; let endsAt: String?; let till: LocalizedText? }
struct PanchangDay: Codable { let dateKey: String; let representedDate, tithi: LocalizedText; let tithiSegments: [PanchangTithi]?; let vrat: LocalizedText?; let sunrise, rahuKaal: LocalizedText; let sunriseAt, sunsetAt: String?; let abhijit: LocalizedText?; let deepLink: String }
struct PanchangSlice: Codable { let timeZone, cityId: String; let cityLabel: LocalizedText; let calendarSystem, validThrough: String; let days: [PanchangDay] }
struct JapamSlice: Codable { let dateKey, timeZone: String; let totalBeads, totalRounds, japaStreak: Int; let lastUsedMantraId: String?; let deepLink: String }
struct WidgetPayload: Codable { let schemaVersion: Int; let generatedAt, writerAppVersion, locale: String; let panchang: PanchangSlice; let verses: VerseSlice; let japam: JapamSlice }

enum PayloadState { case ready(WidgetPayload), missing, invalid, expired }

private let widgetIso: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter(); formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]; return formatter
}()

func widgetDayFormatter(_ timeZone: String) -> DateFormatter {
  let formatter = DateFormatter(); formatter.calendar = Calendar(identifier: .gregorian); formatter.locale = Locale(identifier: "en_US_POSIX")
  formatter.timeZone = TimeZone(identifier: timeZone); formatter.dateFormat = "yyyy-MM-dd"; formatter.isLenient = false; return formatter
}

func widgetDateKey(_ date: Date, timeZone: String) -> String { widgetDayFormatter(timeZone).string(from: date) }

/// Payload instants are ISO-8601 with fractional seconds, the one format the
/// TypeScript writer emits and all three decoders agree on.
func widgetInstant(_ raw: String) -> Date? { widgetIso.date(from: raw) }

/// The tithi running at `at`, and its "तक …" line when this day's solve knows
/// the end — the same forward scan `runningTithi` performs in planner.ts and
/// `WidgetPayloadContract.runningTithi` performs in Kotlin. A payload written
/// before `tithiSegments` existed falls back to the day's sunrise tithi, so an
/// OTA'd JS writer and this binary never disagree about what is drawable.
func runningTithi(_ day: PanchangDay, at: Date) -> (name: LocalizedText, till: LocalizedText?) {
  guard let segments = day.tithiSegments, let last = segments.last else { return (day.tithi, nil) }
  let running = segments.first { segment in
    guard let raw = segment.endsAt, let ends = widgetInstant(raw) else { return true }
    return at <= ends
  } ?? last
  return (running.name, running.till)
}

private func validDateKey(_ key: String) -> Bool {
  guard key.range(of: #"^\d{4}-\d{2}-\d{2}$"#, options: .regularExpression) != nil,
        let date = widgetDayFormatter("UTC").date(from: key) else { return false }
  return widgetDayFormatter("UTC").string(from: date) == key
}

private func validLink(_ raw: String, path: String) -> Bool {
  guard let url = URLComponents(string: raw) else { return false }
  return url.scheme == "vedansh" && url.host == "widget" && url.path == path
}

private func exactLink(_ raw: String, path: String, query: [String: String]) -> Bool {
  guard validLink(raw, path: path), let items = URLComponents(string: raw)?.queryItems else { return query.isEmpty && URLComponents(string: raw)?.query == nil }
  guard items.count == query.count, Set(items.map(\.name)).count == items.count else { return false }
  return items.allSatisfy { item in item.value != nil && query[item.name] == item.value! }
}

/// Ordered, single-ended, anchored to the sunrise tithi — what `runningTithi`'s
/// single forward scan relies on. An unterminated MIDDLE link would stop that
/// scan early for every later instant, so it fails the payload closed.
private func validTithiSegments(_ segments: [PanchangTithi]?, sunriseTithi: LocalizedText) -> Bool {
  guard let segments = segments else { return true }
  guard let first = segments.first else { return false }
  var previous = Date.distantPast
  for (index, segment) in segments.enumerated() {
    guard let raw = segment.endsAt else {
      guard index == segments.count - 1, segment.till == nil else { return false }
      continue
    }
    guard let ends = widgetIso.date(from: raw), segment.till != nil, ends > previous else { return false }
    previous = ends
  }
  return widgetLanguages.allSatisfy { first.name.value($0) == sunriseTithi.value($0) }
}

private func validate(_ value: WidgetPayload) -> Bool {
  guard value.schemaVersion == widgetSupportedSchema, widgetIso.date(from: value.generatedAt) != nil,
        !value.writerAppVersion.isEmpty, widgetLanguages.contains(value.locale), value.panchang.timeZone == widgetIstTimeZone,
        TimeZone(identifier: value.verses.timeZone) != nil, TimeZone(identifier: value.japam.timeZone) != nil,
        !value.panchang.cityId.isEmpty, ["purnimant", "amanta"].contains(value.panchang.calendarSystem),
        widgetIso.date(from: value.panchang.validThrough) != nil, widgetIso.date(from: value.verses.validThrough) != nil,
        !value.panchang.days.isEmpty, !value.verses.days.isEmpty,
        Set(value.panchang.days.map(\.dateKey)).count == value.panchang.days.count,
        Set(value.verses.days.map(\.dateKey)).count == value.verses.days.count,
        validDateKey(value.japam.dateKey), value.japam.totalBeads >= 0, value.japam.totalRounds >= 0, value.japam.japaStreak >= 0,
        (value.japam.lastUsedMantraId == nil || !value.japam.lastUsedMantraId!.isEmpty),
        exactLink(value.japam.deepLink, path: "/japam", query: value.japam.lastUsedMantraId.map { ["mantraId": $0] } ?? [:]) else { return false }
  for day in value.panchang.days {
    guard validDateKey(day.dateKey), day.deepLink == "vedansh://widget/panchang?date=\(day.dateKey)",
          validTithiSegments(day.tithiSegments, sunriseTithi: day.tithi), validSolarWindow(day) else { return false }
  }
  for day in value.verses.days {
    guard (day.artKey == nil || day.artKey!.range(of: #"^[a-z]{1,32}$"#, options: .regularExpression) != nil), validDateKey(day.dateKey), !day.sourceId.isEmpty, day.verseIndex >= 0, (day.chapter == nil || day.chapter! >= 1),
          [day.lines.hi, day.lines.en, day.lines.gu, day.lines.kn].allSatisfy({ !$0.isEmpty && $0.allSatisfy({ !$0.isEmpty }) }),
          exactLink(day.deepLink, path: "/verse", query: ["sourceId": day.sourceId, "verseIndex": String(day.verseIndex)].merging(day.chapter.map { ["chapter": String($0)] } ?? [:]) { current, _ in current }) else { return false }
  }
  return true
}

func decodeWidgetPayload(_ data: Data, now: Date = Date()) -> PayloadState {
  guard validAppearanceFields(data), let value = try? JSONDecoder().decode(WidgetPayload.self, from: data), validate(value),
        let pValid = widgetIso.date(from: value.panchang.validThrough),
        let vValid = widgetIso.date(from: value.verses.validThrough) else { return .invalid }
  return pValid < now || vValid < now ? .expired : .ready(value)
}

func widgetPayloadExpiry(_ value: WidgetPayload) -> Date? {
  guard let pValid = widgetIso.date(from: value.panchang.validThrough),
        let vValid = widgetIso.date(from: value.verses.validThrough) else { return nil }
  return min(pValid, vValid)
}


// Sunrise inclusive, sunset exclusive. Both widget kinds use the selected city's
// IST solar window even when the devotional verse follows another device zone.
func widgetIsNight(_ payload: WidgetPayload, at: Date) -> Bool {
  let key = widgetDateKey(at, timeZone: widgetIstTimeZone)
  guard let day = payload.panchang.days.first(where: { $0.dateKey == key }),
        let riseRaw = day.sunriseAt, let setRaw = day.sunsetAt,
        let rise = widgetInstant(riseRaw), let set = widgetInstant(setRaw), rise < set else { return false }
  return at < rise || at >= set
}

private func validSolarWindow(_ day: PanchangDay) -> Bool {
  if day.sunriseAt == nil && day.sunsetAt == nil { return true }
  guard let r = day.sunriseAt, let s = day.sunsetAt,
        let rise = widgetInstant(r), let set = widgetInstant(s), rise < set else { return false }
  return widgetDateKey(rise, timeZone: widgetIstTimeZone) == day.dateKey && widgetDateKey(set, timeZone: widgetIstTimeZone) == day.dateKey
}

// Codable optionals merge absent and null. Preserve the TypeScript/Kotlin
// distinction: additive fields may be absent, but a present field must be typed.
private func validAppearanceFields(_ data: Data) -> Bool {
  guard let root = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
        let p = root["panchang"] as? [String: Any], let days = p["days"] as? [[String: Any]],
        let v = root["verses"] as? [String: Any], let verses = v["days"] as? [[String: Any]] else { return false }
  for day in days where day.keys.contains("sunriseAt") || day.keys.contains("sunsetAt") {
    guard let rise = day["sunriseAt"] as? String, let set = day["sunsetAt"] as? String,
          rise.range(of: #"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$"#, options: .regularExpression) != nil,
          set.range(of: #"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$"#, options: .regularExpression) != nil else { return false }
  }
  return verses.allSatisfy { !$0.keys.contains("artKey") || $0["artKey"] is String }
}
