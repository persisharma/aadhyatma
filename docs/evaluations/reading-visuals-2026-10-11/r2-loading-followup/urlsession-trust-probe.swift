import Foundation
import CryptoKit
import Security

// Observe the actual native trust challenge. Always retain default TLS validation.
final class TrustRecorder: NSObject, URLSessionDelegate, @unchecked Sendable {
  var subjects: [String] = []
  var fingerprints: [String] = []
  var trustResult: [String: Any] = [:]
  func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge,
                  completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
    if let trust = challenge.protectionSpace.serverTrust,
       let certificates = SecTrustCopyCertificateChain(trust) as? [SecCertificate] {
      subjects = certificates.map { SecCertificateCopySubjectSummary($0) as String? ?? "unknown" }
      fingerprints = certificates.map {
        SHA256.hash(data: SecCertificateCopyData($0) as Data).map { String(format: "%02x", $0) }.joined()
      }
      var error: CFError?
      let accepted = SecTrustEvaluateWithError(trust, &error)
      trustResult["accepted"] = accepted
      if let error {
        trustResult["domain"] = CFErrorGetDomain(error) as String
        trustResult["code"] = CFErrorGetCode(error)
        trustResult["description"] = CFErrorCopyDescription(error) as String
      }
    }
    completionHandler(.performDefaultHandling, nil)
  }
}

let target = CommandLine.arguments.dropFirst().first ?? "https://cdn.vedansh.app/reader-illustrations/47df1919b9ee3f38.webp"
let scope = CommandLine.arguments.dropFirst(2).first ?? "native URLSession diagnostic"
let url = URL(string: target)!
let config = URLSessionConfiguration.default
config.urlCache = nil
config.requestCachePolicy = .reloadIgnoringLocalCacheData
config.timeoutIntervalForRequest = 8
config.timeoutIntervalForResource = 10
let recorder = TrustRecorder()
let session = URLSession(configuration: config, delegate: recorder, delegateQueue: nil)
let signal = DispatchSemaphore(value: 0)
let started = Date()
session.dataTask(with: url) { data, response, error in
  var report: [String: Any] = [
    "scope": scope, "url": target, "sessionType": "default foreground",
    "trustHandling": "performDefaultHandling; no exceptions or custom credentials",
    "checkedAt": ISO8601DateFormatter().string(from: Date()),
    "elapsedSeconds": Date().timeIntervalSince(started),
    "certificateSubjects": recorder.subjects,
    "certificateSHA256": recorder.fingerprints,
    "systemTrustEvaluation": recorder.trustResult,
  ]
  if let error = error as NSError? {
    report["errorDomain"] = error.domain
    report["errorCode"] = error.code
    report["errorDescription"] = error.localizedDescription
    report["streamErrorCode"] = error.userInfo["_kCFStreamErrorCodeKey"]
    if let underlying = error.userInfo[NSUnderlyingErrorKey] as? NSError {
      report["underlyingDomain"] = underlying.domain
      report["underlyingCode"] = underlying.code
    }
  }
  if let response = response as? HTTPURLResponse {
    report["status"] = response.statusCode
    report["contentType"] = response.value(forHTTPHeaderField: "Content-Type")
  }
  if let data {
    report["bytes"] = data.count
    report["sha256"] = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
  }
  let encoded = try! JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
  print(String(data: encoded, encoding: .utf8)!)
  signal.signal()
}.resume()
if signal.wait(timeout: .now() + 15) == .timedOut {
  session.invalidateAndCancel()
  print("{\"diagnosticTimeout\":true}")
  exit(1)
}
