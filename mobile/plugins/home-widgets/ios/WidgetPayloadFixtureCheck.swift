import Foundation

@main struct WidgetPayloadFixtureCheck {
  static func main() throws {
    guard CommandLine.arguments.count == 2 else { throw NSError(domain: "WidgetFixture", code: 1) }
    let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
    guard case .ready = decodeWidgetPayload(data, now: Date(timeIntervalSince1970: 4_071_033_000)) else {
      throw NSError(domain: "WidgetFixture", code: 2, userInfo: [NSLocalizedDescriptionKey: "Fixture rejected by Swift widget decoder"])
    }
    print("Swift widget fixture OK")
  }
}
