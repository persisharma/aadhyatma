import WidgetKit
import SwiftUI
import UIKit
import ImageIO

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
  // The next three are WIDGET_TEXT_TOKENS (catalog.ts), deliberately deeper than the
  // app's inkMuted/saffronDeep/gold: the background art can only be as dark as the
  // lightest text allows at 4.5:1, and the app shades kept it barely visible.
  static let inkMuted = Color(red: 0.290, green: 0.204, blue: 0.125)  // #4A3420 (app colors.inkMuted #6E5230)
  static let saffronDeep = Color(red: 0.420, green: 0.180, blue: 0.020) // #6B2E05 (app colors.saffronDeep #8A3E0B)
  static let gold = Color(red: 0.494, green: 0.353, blue: 0.118)      // #7E5A1E (app colors.gold #A67C34)
}

// The faded sketch behind each system-family widget (design.md §59): one plate per
// (surface, family), pre-cropped and toned onto parchment by
// `scripts/build-widget-backgrounds.mts`, bundled as `vedansh_widget_bg_<surface>_<size>.jpg`.
// The art is strictly optional. Any failure — a Lock Screen family, a tinted/
// vibrant rendering mode, a missing or undecodable file, a plate over the pixel
// budget — returns nil and the widget draws the flat parchment it always has.
enum WidgetArt {
  /// Pixel budget per family = the plate's own size (`WIDGET_BACKGROUND_DIMENSIONS`
  /// in catalog.ts). WidgetKit refuses to archive an image larger than the cell's
  /// pixel area and the widget then renders blank, so an oversize replacement plate
  /// is dropped here instead of costing the whole widget.
  static func maxPixels(_ family: WidgetFamily) -> Int? {
    switch family {
    case .systemSmall: return 256 * 256
    case .systemMedium: return 560 * 260
    case .systemLarge: return 560 * 560
    default: return nil
    }
  }
  private static func sizeName(_ family: WidgetFamily) -> String? {
    switch family {
    case .systemSmall: return "small"
    case .systemMedium: return "medium"
    case .systemLarge: return "large"
    default: return nil
    }
  }
  static func heritage(_ subject: String, _ family: WidgetFamily, night: Bool) -> UIImage? {
    guard let size = sizeName(family), let budget = maxPixels(family) else { return nil }
    let mode = night ? "night" : "day"
    for key in [subject, "prayer"] {
      guard let url = Bundle.main.url(forResource: "vedansh_widget_bg_heritage_\(key)_\(size)_\(mode)", withExtension: "jpg"),
            let image = UIImage(contentsOfFile: url.path), let cg = image.cgImage, cg.width * cg.height <= budget else { continue }
      return image
    }
    return nil
  }
  static func image(_ surface: VedanshSurface, _ family: WidgetFamily) -> UIImage? {
    guard let size = sizeName(family), let budget = maxPixels(family),
          let url = Bundle.main.url(forResource: "vedansh_widget_bg_\(surface.rawValue)_\(size)", withExtension: "jpg"),
          let image = UIImage(contentsOfFile: url.path), let cg = image.cgImage,
          cg.width * cg.height <= budget else { return nil }
    return image
  }
  // Downsample once into a bounded image, with its devotional subject in focus.
  // Source files are copied into the WidgetKit extension by withHomeWidgetsIos.
  // Cache only the small prepared image, not the full resolution painting.
  private static let vividCache: NSCache<NSString, UIImage> = {
    let cache = NSCache<NSString, UIImage>()
    cache.countLimit = 4
    cache.totalCostLimit = 6 * 1024 * 1024
    return cache
  }()
  private static let focusX: [String: CGFloat] = [
    "prayer": 0.5, "vishnu": 0.28, "krishna": 0.5, "shiva": 0.43,
    "hanuman": 0.42, "rama": 0.5, "ganesha": 0.5, "durga": 0.5,
    "saraswati": 0.5, "surya": 0.5, "panchang": 0.5
  ]
  static func vivid(_ subject: String, _ family: WidgetFamily) -> UIImage? {
    guard let budget = maxPixels(family) else { return nil }
    let safe = focusX[subject] == nil ? "prayer" : subject
    let cacheKey = "\(safe)-\(family)" as NSString
    if let cached = vividCache.object(forKey: cacheKey) { return cached }
    guard let url = Bundle.main.url(forResource: "vedansh_heritage_source_\(safe)", withExtension: "webp"),
          let source = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    let maxSize = family == .systemSmall ? 256 : (family == .systemLarge ? 1024 : 768)
    let opts: [CFString: Any] = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailMaxPixelSize: maxSize,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceShouldCacheImmediately: true
    ]
    guard let thumb = CGImageSourceCreateThumbnailAtIndex(source, 0, opts as CFDictionary) else { return nil }
    let aspect: CGFloat = family == .systemLarge ? 0.77 : (family == .systemSmall ? 1.0 : 1.23)
    let cropWidth = min(thumb.width, max(1, Int(CGFloat(thumb.height) * aspect)))
    let focus = focusX[safe] ?? 0.5
    let start = max(0, min(thumb.width - cropWidth, Int(CGFloat(thumb.width) * focus) - cropWidth / 2))
    guard let crop = thumb.cropping(to: CGRect(x: start, y: 0, width: cropWidth, height: thumb.height)) else { return nil }
    // Portrait/square source paintings can exceed the rectangular medium-cell
    // budget after cropping. Downscale them instead of silently losing vivid
    // artwork for every source other than the landscape Vishnu image.
    let prepared: UIImage
    if crop.width * crop.height <= budget {
      prepared = UIImage(cgImage: crop)
    } else {
      let ratio = sqrt(CGFloat(budget) / CGFloat(crop.width * crop.height))
      let size = CGSize(width: max(1, floor(CGFloat(crop.width) * ratio)),
                        height: max(1, floor(CGFloat(crop.height) * ratio)))
      let format = UIGraphicsImageRendererFormat.default()
      // A 2x/3x device renderer would silently exceed WidgetKit's pixel
      // archival budget even after our crop math: this is a pixel-sized plate.
      format.scale = 1
      let renderer = UIGraphicsImageRenderer(size: size, format: format)
      prepared = renderer.image { _ in
        UIImage(cgImage: crop).draw(in: CGRect(origin: .zero, size: size))
      }
    }
    let pixelCost = Int(prepared.size.width * prepared.scale * prepared.size.height * prepared.scale * 4)
    vividCache.setObject(prepared, forKey: cacheKey, cost: pixelCost)
    return prepared
  }
}

private struct WidgetPalette {
  let night: Bool
  var parchment: Color { night ? Color(red: 0.035, green: 0.102, blue: 0.196) : WidgetTheme.parchment }
  var ink: Color { night ? Color(red: 1.000, green: 0.957, blue: 0.863) : Color(red: 0.318, green: 0.106, blue: 0.098) }
  var inkMuted: Color { night ? Color(red: 0.910, green: 0.839, blue: 0.706) : WidgetTheme.inkMuted }
  var saffronDeep: Color { night ? Color(red: 0.922, green: 0.780, blue: 0.518) : WidgetTheme.saffronDeep }
  var gold: Color { night ? Color(red: 0.851, green: 0.714, blue: 0.431) : WidgetTheme.gold }
}

// Ornamentation is native vector drawing, not text baked into a picture.
// It stays crisp on every iPhone scale and is never decoded from the network.
private struct HeritageFiligree: View {
  let palette: WidgetPalette
  var body: some View {
    Canvas { context, size in
      guard size.width > 35, size.height > 35 else { return }
      let outer = Path(roundedRect: CGRect(x: 2.7, y: 2.7, width: size.width - 5.4, height: size.height - 5.4), cornerRadius: 21)
      let inner = Path(roundedRect: CGRect(x: 6, y: 6, width: size.width - 12, height: size.height - 12), cornerRadius: 18)
      context.stroke(outer, with: .color(palette.gold.opacity(0.76)), lineWidth: 0.9)
      context.stroke(inner, with: .color(palette.gold.opacity(0.30)), lineWidth: 0.4)
      for mirror in [false, true] {
        let x = mirror ? size.width - 12 : 12
        let sign: CGFloat = mirror ? -1 : 1
        var curl = Path()
        curl.move(to: CGPoint(x: x, y: 35))
        curl.addQuadCurve(to: CGPoint(x: x + 20 * sign, y: 10), control: CGPoint(x: x + 1 * sign, y: 10))
        curl.addQuadCurve(to: CGPoint(x: x + 34 * sign, y: 10), control: CGPoint(x: x + 25 * sign, y: 15))
        context.stroke(curl, with: .color(palette.gold.opacity(0.50)), lineWidth: 0.8)
        var base = Path()
        base.move(to: CGPoint(x: x, y: size.height - 35))
        base.addQuadCurve(to: CGPoint(x: x + 20 * sign, y: size.height - 10), control: CGPoint(x: x + sign, y: size.height - 10))
        base.addQuadCurve(to: CGPoint(x: x + 34 * sign, y: size.height - 10), control: CGPoint(x: x + 25 * sign, y: size.height - 15))
        context.stroke(base, with: .color(palette.gold.opacity(0.50)), lineWidth: 0.8)
      }
      let center = CGPoint(x: size.width * 0.5, y: size.height - 12)
      for i in 0..<5 {
        let angle = CGFloat(i) * (.pi / 4) - .pi / 2
        let px = center.x + cos(angle) * 4
        let py = center.y + sin(angle) * 4
        let petal = Path(ellipseIn: CGRect(x: px - 2.1, y: py - 4.1, width: 4.2, height: 8.2))
        context.stroke(petal, with: .color(palette.gold.opacity(0.68)), lineWidth: 0.7)
      }
    }
    .accessibilityHidden(true)
    .allowsHitTesting(false)
  }
}

// Small almanac cameo from the approved design: a warm temple spire/flag.
// Purely decorative, with no unsupported festival, direction or time claim.
private struct TempleDawnCameo: View {
  let palette: WidgetPalette
  var body: some View {
    ZStack {
      Circle()
        .fill(RadialGradient(colors: [palette.gold.opacity(0.25), .clear],
                             center: .center, startRadius: 2, endRadius: 36))
        .frame(width: 66, height: 66)
      Canvas { context, size in
        let x = size.width
        let y = size.height
        var building = Path()
        building.move(to: CGPoint(x: 0.20 * x, y: 0.80 * y))
        building.addLine(to: CGPoint(x: 0.80 * x, y: 0.80 * y))
        building.addLine(to: CGPoint(x: 0.73 * x, y: 0.68 * y))
        building.addLine(to: CGPoint(x: 0.27 * x, y: 0.68 * y))
        building.closeSubpath()
        context.fill(building, with: .color(palette.saffronDeep.opacity(0.54)))
        var spire = Path()
        spire.move(to: CGPoint(x: 0.34 * x, y: 0.68 * y))
        spire.addLine(to: CGPoint(x: 0.38 * x, y: 0.42 * y))
        spire.addLine(to: CGPoint(x: 0.50 * x, y: 0.18 * y))
        spire.addLine(to: CGPoint(x: 0.62 * x, y: 0.42 * y))
        spire.addLine(to: CGPoint(x: 0.66 * x, y: 0.68 * y))
        spire.closeSubpath()
        context.fill(spire, with: .color(palette.saffronDeep.opacity(0.58)))
        var flag = Path()
        flag.move(to: CGPoint(x: 0.50 * x, y: 0.20 * y))
        flag.addLine(to: CGPoint(x: 0.50 * x, y: 0.04 * y))
        flag.addLine(to: CGPoint(x: 0.76 * x, y: 0.11 * y))
        flag.addLine(to: CGPoint(x: 0.50 * x, y: 0.15 * y))
        context.stroke(flag, with: .color(palette.gold), lineWidth: 1)
      }
      .frame(width: 57, height: 57)
    }
    .accessibilityHidden(true)
    .allowsHitTesting(false)
  }
}

private struct FestivalMountain: Shape {
  func path(in rect: CGRect) -> Path {
    var outline = Path()
    outline.move(to: CGPoint(x: 0, y: rect.maxY))
    outline.addLine(to: CGPoint(x: rect.width * 0.38, y: rect.minY))
    outline.addLine(to: CGPoint(x: rect.width * 0.65, y: rect.maxY))
    outline.closeSubpath()
    outline.move(to: CGPoint(x: rect.width * 0.43, y: rect.maxY))
    outline.addLine(to: CGPoint(x: rect.width * 0.73, y: rect.height * 0.35))
    outline.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
    outline.closeSubpath()
    return outline
  }
}

private struct WidgetBackdrop: View {
  let art: UIImage?
  let vivid: UIImage?
  let surface: VedanshSurface
  let night: Bool
  var body: some View {
    GeometryReader { geo in
      ZStack {
        WidgetPalette(night: night).parchment
        // The prewashed original is the safe fallback and protects tinted/legacy
        // cases. Daytime full-colour mode overlays the approved vivid painting.
        if let art {
          Image(uiImage: art).resizable().scaledToFill()
            .frame(width: geo.size.width, height: geo.size.height)
            .clipped().accessibilityHidden(true)
        }
        if let vivid {
          let square = surface == .panchang
          let width = geo.size.width * (square ? 0.38 : 0.59)
          let height = geo.size.height * (square ? 0.50 : 1)
          Image(uiImage: vivid).resizable().scaledToFill()
            .frame(width: width, height: height)
            .clipped()
            .mask {
              LinearGradient(stops: [
                .init(color: .clear, location: 0),
                .init(color: .white.opacity(0.35), location: 0.18),
                .init(color: .white, location: 0.46)
              ], startPoint: .leading, endPoint: .trailing)
            }
            .position(x: geo.size.width - width * 0.50 - 4,
                      y: square ? height * 0.5 + 4 : geo.size.height * 0.5)
            .accessibilityHidden(true)
        }
        if surface == .panchang && vivid != nil {
          TempleDawnCameo(palette: WidgetPalette(night: night))
            .frame(width: 60, height: 60)
            .position(x: geo.size.width - 31, y: 36)
        }
        if art != nil || vivid != nil {
          HeritageFiligree(palette: WidgetPalette(night: night))
        }
      }
      .frame(width: geo.size.width, height: geo.size.height)
    }
  }
}

private extension View {
  @ViewBuilder func vedanshWidgetBackground(_ art: UIImage?, vivid: UIImage?, surface: VedanshSurface, night: Bool) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) { WidgetBackdrop(art: art, vivid: vivid, surface: surface, night: night) }
    } else if art != nil || vivid != nil {
      frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(WidgetBackdrop(art: art, vivid: vivid, surface: surface, night: night)).clipped()
    } else { background(WidgetPalette(night: night).parchment) }
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
      // A tithi hands over MID-DAY, not at midnight, so a timeline built only
      // from civil-day boundaries pinned the headline to the sunrise tithi for
      // a further fifteen hours while the app's own glance had already moved on
      // (Sept 2026). One entry ON each solved handover is what makes the widget
      // turn over when the Panchang does (design.md §59).
      for raw in [day.sunriseAt, day.sunsetAt].compactMap({ $0 }) {
        if let solar = widgetInstant(raw), solar > now { dates.insert(solar) }
      }
      for segment in day.tithiSegments ?? [] {
        if let raw = segment.endsAt, let ends = widgetInstant(raw)?.addingTimeInterval(1), ends > now { dates.insert(ends) }
      }
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
enum VedanshSurface: String { case verse, panchang, japam }

struct VedanshWidgetView: View {
  @Environment(\.widgetFamily) var family
  @Environment(\.widgetRenderingMode) var renderingMode
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
    }.vedanshWidgetBackground(art, vivid: vividArt, surface: surface, night: palette.night)
  }

  // Art only behind real content in full colour. Recovery cards stay the plain
  // parchment they always were, and the tinted/vibrant modes (iOS 18 tinted Home
  // Screen, StandBy at night) would grey the sketch into a smudge behind the text.
  private var palette: WidgetPalette {
    guard surface != .japam, renderingMode == .fullColor,
          case .ready(let payload) = entry.state, hasContent(payload) else { return WidgetPalette(night: false) }
    return WidgetPalette(night: widgetIsNight(payload, at: entry.date))
  }

  private var art: UIImage? {
    guard renderingMode == .fullColor, case .ready(let payload) = entry.state, hasContent(payload) else { return nil }
    if surface == .japam { return WidgetArt.image(surface, family) }
    if surface == .verse && family == .systemSmall { return nil }
    let verseKey = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
    let subject = surface == .panchang ? "panchang" : (payload.verses.days.first(where: { $0.dateKey == verseKey })?.artKey ?? "prayer")
    return WidgetArt.heritage(subject, family, night: palette.night)
  }

  private var vividArt: UIImage? {
    guard surface != .japam, renderingMode == .fullColor, !palette.night,
          case .ready(let payload) = entry.state, hasContent(payload) else { return nil }
    if surface == .verse && family == .systemSmall { return nil }
    let key = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
    let source = surface == .panchang ? "panchang"
      : (payload.verses.days.first(where: { $0.dateKey == key })?.artKey ?? "prayer")
    return WidgetArt.vivid(source, family)
  }

  /// Whether this entry renders the surface's dated content rather than a refresh card.
  private func hasContent(_ payload: WidgetPayload) -> Bool {
    switch surface {
    case .verse:
      let key = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
      return payload.verses.days.contains { $0.dateKey == key }
    case .panchang:
      let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
      return payload.panchang.days.contains { $0.dateKey == key }
    case .japam:
      return payload.japam.dateKey == widgetDateKey(entry.date, timeZone: payload.japam.timeZone)
    }
  }

  // MARK: - आज का श्लोक
  // Visual contract: ornate brand centered above a saffron ribbon, readable
  // Sanskrit in a left ink-safe zone, an integrated scripture credit, and
  // vibrant deity painting on the right. All visible text remains native.
  @ViewBuilder private func verse(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: payload.verses.timeZone)
    let lang = payload.locale
    if let v = payload.verses.days.first(where: { $0.dateKey == key }) {
      GeometryReader { geometry in
        Group {
          if family == .systemSmall {
            VStack(alignment: .leading, spacing: 6) {
              Text(verseKicker(lang))
                .font(.custom(fontName(lang, bold: true), size: 11))
                .foregroundStyle(palette.saffronDeep)
              Text(v.excerpt.value(lang))
                .font(.custom(fontName(lang, bold: false), size: 14))
                .foregroundStyle(palette.ink)
                .lineLimit(4).minimumScaleFactor(0.9)
              Spacer(minLength: 0)
              brand()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
          } else {
            VStack(alignment: .leading, spacing: 5) {
              HStack(spacing: 8) {
                Rectangle().fill(palette.gold.opacity(0.56)).frame(height: 1)
                Image(systemName: "leaf.fill").font(.system(size: 9, weight: .regular))
                  .foregroundStyle(palette.gold).accessibilityHidden(true)
                Text("ॐ वेदांश")
                  .font(.custom("NotoSerifDevanagari-SemiBold", size: family == .systemLarge ? 19 : 15))
                  .foregroundStyle(palette.ink)
                  .fixedSize()
                Image(systemName: "leaf.fill").font(.system(size: 9, weight: .regular))
                  .foregroundStyle(palette.gold).scaleEffect(x: -1, y: 1).accessibilityHidden(true)
                Rectangle().fill(palette.gold.opacity(0.56)).frame(height: 1)
              }
              .padding(.horizontal, family == .systemLarge ? 16 : 36)
              .accessibilityHidden(true)
              Spacer(minLength: 0)
              ViewThatFits(in: .vertical) {
                verseComposition(v, lang: lang, width: geometry.size.width,
                                 artFraction: 0.32, fontSize: family == .systemLarge ? 21 : 18,
                                 separated: family == .systemLarge, condensed: false)
                verseComposition(v, lang: lang, width: geometry.size.width,
                                 artFraction: 0.16, fontSize: family == .systemLarge ? 18 : 16,
                                 separated: family == .systemLarge, condensed: false)
                verseComposition(v, lang: lang, width: geometry.size.width,
                                 artFraction: 0, fontSize: family == .systemLarge ? 16 : 14,
                                 separated: false, condensed: false)
                verseComposition(v, lang: lang, width: geometry.size.width,
                                 artFraction: 0, fontSize: family == .systemLarge ? 15 : 14,
                                 separated: false, condensed: true)
              }
              Spacer(minLength: 0)
            }
            .padding(.horizontal, 2)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
          }
        }
        .widgetURL(URL(string: v.deepLink))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(v.accessibilityLabel.value(lang))
      }
    } else { recovery("विजेट ताज़ा करने हेतु वेदांश़ खोलें", "Open Vedansh to refresh") }
  }

  private func verseComposition(_ v: VerseDay, lang: String, width: CGFloat,
                                artFraction: CGFloat, fontSize: CGFloat,
                                separated: Bool, condensed: Bool) -> some View {
    let reserved = art == nil ? CGFloat(0) : width * artFraction
    return VStack(alignment: .leading, spacing: family == .systemLarge ? 8 : 5) {
      HStack(spacing: 5) {
        Image(systemName: "leaf.fill")
          .font(.system(size: 10, weight: .regular)).accessibilityHidden(true)
        Text(verseKicker(lang))
          .font(.custom(fontName(lang, bold: true), size: 11))
          .lineLimit(1)
          .minimumScaleFactor(0.85)
      }
      .foregroundStyle(palette.night ? palette.parchment : .white)
      .padding(.horizontal, 9).padding(.vertical, 5)
      .background(
        LinearGradient(colors: [palette.saffronDeep, palette.saffronDeep.opacity(0.83)],
                       startPoint: .leading, endPoint: .trailing),
        in: RoundedRectangle(cornerRadius: 8)
      )

      if separated {
        VStack(alignment: .leading, spacing: 3) {
          ForEach(Array(v.lines.value(lang).enumerated()), id: \.offset) { item in
            Text(item.element)
              .font(.custom(fontName(lang, bold: false), size: fontSize))
              .foregroundStyle(palette.ink)
              .fixedSize(horizontal: false, vertical: true)
          }
        }
      } else {
        Text(flowedVerse(v.lines.value(lang)))
          .font(.custom(fontName(lang, bold: false), size: fontSize))
          .foregroundStyle(palette.ink)
          .lineLimit(condensed ? (family == .systemLarge ? 10 : 4) : nil)
          .truncationMode(.tail)
          .fixedSize(horizontal: false, vertical: !condensed)
      }

      HStack(alignment: .center, spacing: 6) {
        Image(systemName: "book.closed")
          .font(.system(size: 12, weight: .regular))
          .foregroundStyle(palette.saffronDeep).accessibilityHidden(true)
        Text(v.source.value(lang))
          .font(.custom(fontName(lang, bold: true), size: 11))
          .foregroundStyle(palette.inkMuted)
          .fixedSize(horizontal: false, vertical: true)
      }
      HStack(spacing: 4) {
        Rectangle().fill(palette.gold.opacity(0.62)).frame(height: 1)
        Image(systemName: "leaf.fill").font(.system(size: 9))
          .foregroundStyle(palette.gold).accessibilityHidden(true)
        Rectangle().fill(palette.gold.opacity(0.62)).frame(height: 1)
      }
      .padding(.top, 1)
      if condensed {
        Text(readFullVerseKicker(lang))
          .font(.custom(fontName(lang, bold: true), size: 10))
          .foregroundStyle(palette.saffronDeep)
      }
    }
    .padding(.trailing, reserved)
    .padding(.vertical, 2)
    .background {
      if art != nil && artFraction == 0 {
        palette.parchment.opacity(0.93)
      }
    }
    .fixedSize(horizontal: false, vertical: true)
  }

  private func readFullVerseKicker(_ lang: String) -> String {
    lang == "en" ? "Tap to read the complete verse ›"
      : lang == "gu" ? "આખો શ્લોક વાંચવા ટૅપ કરો ›"
      : lang == "kn" ? "ಪೂರ್ಣ ಶ್ಲೋಕ ಓದಲು ಸ್ಪರ್ಶಿಸಿ ›"
      : "पूरा श्लोक पढ़ने के लिए टैप करें ›"
  }

  // The decorative crescent is an almanac emblem, NOT a computed Moon phase.
  // A precise phase would need its own numerical ephemeris field.
  private struct AlmanacMoonSeal: View {
    let palette: WidgetPalette
    var body: some View {
      ZStack {
        Circle().fill(palette.gold.opacity(0.10))
        Circle().strokeBorder(palette.gold.opacity(0.88), lineWidth: 1)
        Circle().fill(palette.inkMuted.opacity(0.88)).padding(8)
        Circle().fill(palette.parchment).padding(9)
          .offset(x: 6, y: -2)
      }
      .accessibilityHidden(true)
    }
  }

  private func widgetSolarLabel(_ lang: String, sunset: Bool) -> String {
    if sunset {
      return lang == "en" ? "Sunset" : lang == "gu" ? "સૂર્યાસ્ત" :
        lang == "kn" ? "ಸೂರ್ಯಾಸ್ತ" : "सूर्यास्त"
    }
    return lang == "en" ? "Sunrise" : lang == "gu" ? "સૂર્યોદય" :
      lang == "kn" ? "ಸೂರ್ಯೋದಯ" : "सूर्योदय"
  }

  private func sunsetTime(_ p: PanchangDay) -> String? {
    guard let raw = p.sunsetAt, let instant = widgetInstant(raw) else { return nil }
    let formatter = DateFormatter()
    formatter.timeZone = TimeZone(identifier: widgetIstTimeZone)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "HH:mm"
    return formatter.string(from: instant)
  }

  private func sunriseTime(_ p: PanchangDay, lang: String) -> String {
    let full = p.sunrise.value(lang)
    return full.split(separator: " ").last.map(String.init) ?? full
  }

  private func almanacSolarColumn(_ title: String, time: String, sunset: Bool, lang: String,
                                  condensed: Bool) -> some View {
    VStack(alignment: .center, spacing: condensed ? 1 : 3) {
      HStack(spacing: 3) {
        Image(systemName: sunset ? "sunset.fill" : "sunrise.fill")
          .font(.system(size: condensed ? 10 : 11)).accessibilityHidden(true)
        Text(title)
          .font(.custom(fontName(lang, bold: true), size: 10))
          .lineLimit(1).minimumScaleFactor(0.78)
      }
      .foregroundStyle(palette.saffronDeep)
      Text(time)
        .font(.custom(fontName(lang, bold: true), size: condensed ? 13 : 16))
        .foregroundStyle(palette.ink)
        .lineLimit(1)
    }
    .frame(maxWidth: .infinity)
  }

  private func smallPanchang(_ p: PanchangDay,
                             running: (name: LocalizedText, till: LocalizedText?),
                             city: String, lang: String, compact: Bool) -> some View {
    let sunset = sunsetTime(p)
    return VStack(alignment: .leading, spacing: compact ? 4 : 7) {
      HStack(spacing: 4) {
        Image(systemName: "calendar").font(.system(size: 11, weight: .semibold))
          .accessibilityHidden(true)
        Text("\(p.representedDate.value(lang)) · \(city)")
          .font(.custom(fontName(lang, bold: true), size: 11))
          .lineLimit(1).minimumScaleFactor(0.8)
      }
      .foregroundStyle(palette.saffronDeep)
      .padding(.trailing, 27)

      HStack(alignment: .center, spacing: compact ? 7 : 9) {
        AlmanacMoonSeal(palette: palette)
          .frame(width: compact ? 32 : 43, height: compact ? 32 : 43)
        Text(running.name.value(lang))
          .font(.custom(fontName(lang, bold: true), size: compact ? 22 : 28))
          .foregroundStyle(palette.ink)
          .lineLimit(2).minimumScaleFactor(0.82)
          .fixedSize(horizontal: false, vertical: true)
      }
      if let till = running.till {
        Text(till.value(lang))
          .font(.custom(fontName(lang, bold: true), size: 10))
          .foregroundStyle(palette.inkMuted)
          .lineLimit(1).minimumScaleFactor(0.8)
      }
      if let vrat = p.vrat {
        HStack(alignment: .firstTextBaseline, spacing: 5) {
          if vrat.hi.contains("गोवर्धन") {
            FestivalMountain().fill(palette.saffronDeep)
              .frame(width: 18, height: 14).accessibilityHidden(true)
          } else {
            Image(systemName: "sparkles").font(.system(size: 11))
              .foregroundStyle(palette.saffronDeep).accessibilityHidden(true)
          }
          Text(vrat.value(lang))
            .font(.custom(fontName(lang, bold: true), size: compact ? 12 : 14))
            .foregroundStyle(palette.ink)
            .lineLimit(compact ? 1 : 2)
            .minimumScaleFactor(0.84)
        }
        .padding(.vertical, compact ? 1 : 2)
      }
      Spacer(minLength: 0)
      HStack(spacing: 4) {
        Rectangle().fill(palette.gold.opacity(0.69)).frame(height: 1)
        Image(systemName: "leaf.fill").font(.system(size: 8))
          .foregroundStyle(palette.gold).accessibilityHidden(true)
        Rectangle().fill(palette.gold.opacity(0.69)).frame(height: 1)
      }
      HStack(alignment: .center, spacing: 0) {
        almanacSolarColumn(widgetSolarLabel(lang, sunset: false),
                           time: sunriseTime(p, lang: lang),
                           sunset: false, lang: lang, condensed: compact)
        if let sunset {
          Rectangle().fill(palette.gold.opacity(0.6))
            .frame(width: 1, height: compact ? 22 : 29)
          almanacSolarColumn(widgetSolarLabel(lang, sunset: true),
                             time: sunset, sunset: true, lang: lang, condensed: compact)
        }
      }
    }
    .padding(.vertical, 1)
    .frame(maxWidth: .infinity, alignment: .topLeading)
    .fixedSize(horizontal: false, vertical: true)
  }

  // MARK: - आज का पंचांग
  // Small is the glance (date, tithi, sunrise); medium adds Rahu Kaal on one line;
  // large gives every window its own labelled row, Abhijit included.
  @ViewBuilder private func panchang(_ payload: WidgetPayload) -> some View {
    let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    let lang = payload.locale
    if let p = payload.panchang.days.first(where: { $0.dateKey == key }) {
      // The headline is the tithi running AT THIS ENTRY's instant, not the
      // day's sunrise tithi — `getTimeline` above puts an entry on every solved
      // handover so this resolves forward through the day exactly as the app's
      // `prevailingTithi` does.
      let running = runningTithi(p, at: entry.date)
      if family == .accessoryInline {
        // The Lock Screen line needs its own `.widgetURL`: the modifier below
        // belongs to the else-branch's VStack, and an accessory widget with no
        // URL is INERT — tapping it does nothing at all, forever, which is how
        // the placed Lock Screen Panchang widget read as "the tap goes nowhere"
        // (Sept 2026). Same shape as japam's `.accessoryCircular` branch.
        Text(p.vrat?.value(lang) ?? running.name.value(lang))
          .widgetURL(URL(string: p.deepLink))
          .accessibilityLabel("\(p.representedDate.value(lang)), \(running.name.value(lang))")
      } else if family == .systemSmall {
        ViewThatFits(in: .vertical) {
          smallPanchang(p, running: running, city: payload.panchang.cityLabel.value(lang),
                        lang: lang, compact: false)
          smallPanchang(p, running: running, city: payload.panchang.cityLabel.value(lang),
                        lang: lang, compact: true)
        }
        .widgetURL(URL(string: p.deepLink))
        .accessibilityElement(children: .combine)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      } else {
        VStack(alignment: .leading, spacing: family == .systemLarge ? 7 : 5) {
          Text("\(p.representedDate.value(lang)) · \(payload.panchang.cityLabel.value(lang))")
            .font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(palette.saffronDeep)
            .lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(1)
            .padding(.trailing, art == nil ? 0 : 36)
          Text(running.name.value(lang))
            .font(.custom(fontName(lang, bold: true), size: family == .systemLarge ? 32 : family == .systemSmall ? 24 : 24))
            .foregroundStyle(palette.ink).lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(0.75)
          // "तक 10:48" — when the headline stops being true, the one fact a
          // dated tithi glance is useless without. Absent only when this day's
          // solve does not know the end (the successor's end belongs to
          // tomorrow's solve), matching the Home glance's own omission.
          if let till = running.till {
            Text(till.value(lang)).font(.system(size: family == .systemLarge ? 13 : 10, weight: .semibold))
              .foregroundStyle(palette.inkMuted).lineLimit(1).minimumScaleFactor(0.8)
          }
          if let vrat = p.vrat {
            Text(vrat.value(lang)).font(.custom(fontName(lang, bold: false), size: 12)).foregroundStyle(palette.inkMuted)
              .lineLimit(family == .systemSmall ? 2 : 1).minimumScaleFactor(0.85)
          }
          if family == .systemSmall {
            Divider().overlay(palette.gold.opacity(0.5))
            Text(p.sunrise.value(lang)).font(.system(size: 10, weight: .semibold)).foregroundStyle(palette.inkMuted).lineLimit(1).minimumScaleFactor(0.8)
          } else if family == .systemLarge {
            VStack(alignment: .leading, spacing: 4) {
              Text(p.sunrise.value(lang)); Text(p.rahuKaal.value(lang))
              if let abhijit = p.abhijit { Text(abhijit.value(lang)) }
            }.font(.system(size: 13, weight: .semibold)).foregroundStyle(palette.inkMuted)
          } else {
            Text("\(p.sunrise.value(lang))   \(p.rahuKaal.value(lang))").font(.system(size: 10, weight: .semibold)).foregroundStyle(palette.inkMuted).lineLimit(1)
          }
          brand()
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
        Text(japamKicker(lang)).font(.custom(fontName(lang, bold: true), size: 10)).foregroundStyle(palette.saffronDeep).lineLimit(1)
        Text("\(payload.japam.totalBeads) / 108").font(.custom(fontName(lang, bold: true), size: family == .systemMedium ? 34 : 27)).foregroundStyle(palette.ink)
        Text(lang == "en" ? "\(payload.japam.totalRounds) rounds · \(payload.japam.japaStreak) days" : "\(payload.japam.totalRounds) माला · \(payload.japam.japaStreak) जप-दिन").font(.system(size: 11, weight: .semibold)).foregroundStyle(palette.inkMuted)
        brand()
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .widgetURL(URL(string: payload.japam.deepLink)).accessibilityElement(children: .combine)
    }
  }

  private func recovery(_ hi: String, _ en: String) -> some View {
    let key = widgetDateKey(entry.date, timeZone: widgetIstTimeZone)
    return VStack(alignment: .leading, spacing: 8) { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 13)).foregroundStyle(palette.ink); Text(hi).font(.custom("NotoSerifDevanagari-Medium", size: 13)).foregroundStyle(palette.ink); Text(en).font(.system(size: 10, weight: .semibold)).foregroundStyle(palette.inkMuted) }
      .widgetURL(URL(string: "vedansh://widget/panchang?date=\(key)"))
  }
  private func brand() -> some View { Text("ॐ वेदांश़").font(.custom("NotoSerifDevanagari-SemiBold", size: 10)).foregroundStyle(palette.gold) }
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

