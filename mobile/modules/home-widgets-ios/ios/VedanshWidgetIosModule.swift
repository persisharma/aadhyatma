import ExpoModulesCore
import Foundation
import WidgetKit

private let appGroup = "group.com.prashantsharma.vedansh.widgets"
private let payloadName = "widget-payload-v1.json"

private func payloadURL() throws -> URL {
  guard let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
    throw NSError(domain: "VedanshWidgetIos", code: 1, userInfo: [NSLocalizedDescriptionKey: "App Group container unavailable"])
  }
  return container.appendingPathComponent(payloadName)
}

public class VedanshWidgetIosModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VedanshWidgetIos")
    AsyncFunction("writePayload") { (payload: String) -> Void in
      guard let data = payload.data(using: .utf8) else { throw NSError(domain: "VedanshWidgetIos", code: 2) }
      let destination = try payloadURL()
      // Foundation's .atomic writes to a sibling temp file in the same container
      // then renames it into place, so a reader in the extension always sees the
      // whole old or whole new file — never a partial one — and leaves no orphan
      // temp file behind on failure (the prior manual temp/replace dance did).
      try data.write(to: destination, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
      WidgetCenter.shared.reloadAllTimelines()
    }
    AsyncFunction("readPayload") { () -> String? in
      let destination = try payloadURL()
      guard let data = try? Data(contentsOf: destination) else { return nil }
      return String(data: data, encoding: .utf8)
    }
  }
}
