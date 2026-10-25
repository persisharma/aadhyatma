import ExpoModulesCore
import ImageIO
import Vision

/// Face boxes for the Suvichar sender photo, found on-device with Apple Vision. Nothing leaves the phone.
/// Boxes are normalized to the displayed (orientation-applied) image with a top-left origin, so JS can
/// fit every face into the round photo without re-encoding the file.
public class SuvicharFaceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SuvicharFace")

    AsyncFunction("detect") { (uri: String) throws -> [String: Any] in
      let options: [CFString: Any] = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: 1024,
      ]
      guard let url = URL(string: uri),
            let source = CGImageSourceCreateWithURL(url as CFURL, nil),
            let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else {
        throw Exception(name: "ERR_SUVICHAR_FACE_READ", description: "Could not read the photo")
      }
      let request = VNDetectFaceRectanglesRequest()
      try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
      // Vision's boxes are normalized with a bottom-left origin.
      let faces: [[String: Double]] = (request.results ?? []).map { face in
        let box = face.boundingBox
        return ["x": Double(box.minX), "y": Double(1 - box.maxY), "width": Double(box.width), "height": Double(box.height)]
      }
      return ["width": image.width, "height": image.height, "faces": faces]
    }
  }
}
