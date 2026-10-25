package expo.modules.vedanshface

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.graphics.PointF
import android.media.ExifInterface
import android.media.FaceDetector
import android.net.Uri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Face boxes for the Suvichar sender photo, found on-device with the platform FaceDetector
 * (no Play Services, no model download). Nothing leaves the phone. Boxes are normalized to the
 * displayed (EXIF-rotated) image with a top-left origin, matching what the Image view draws.
 */
class SuvicharFaceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SuvicharFace")

    AsyncFunction("detect") { uri: String ->
      val resolver = appContext.reactContext?.contentResolver ?: throw CodedException("Context unavailable", null)
      val source = Uri.parse(uri)
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      resolver.openInputStream(source)?.use { BitmapFactory.decodeStream(it, null, bounds) }
      if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw CodedException("Could not read the photo", null)
      var sample = 1
      while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= 1024) sample *= 2
      val decode = BitmapFactory.Options().apply { inSampleSize = sample; inPreferredConfig = Bitmap.Config.RGB_565 }
      var bitmap = resolver.openInputStream(source)?.use { BitmapFactory.decodeStream(it, null, decode) }
        ?: throw CodedException("Could not read the photo", null)
      val rotation = resolver.openInputStream(source)?.use {
        when (ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
          ExifInterface.ORIENTATION_ROTATE_90 -> 90f
          ExifInterface.ORIENTATION_ROTATE_180 -> 180f
          ExifInterface.ORIENTATION_ROTATE_270 -> 270f
          else -> 0f
        }
      } ?: 0f
      if (rotation != 0f) bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Matrix().apply { postRotate(rotation) }, false)
      // FaceDetector needs an RGB_565 bitmap of even width.
      if (bitmap.width % 2 != 0) bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width - 1, bitmap.height)
      if (bitmap.config != Bitmap.Config.RGB_565) bitmap = bitmap.copy(Bitmap.Config.RGB_565, false)
      val width = bitmap.width.toDouble()
      val height = bitmap.height.toDouble()
      val found = arrayOfNulls<FaceDetector.Face>(MAX_FACES)
      val count = FaceDetector(bitmap.width, bitmap.height, MAX_FACES).findFaces(bitmap, found)
      bitmap.recycle()
      val eyes = PointF()
      // The detector reports the eye midpoint and eye distance; a face is about 2.2 × 2.9 eye distances,
      // with the eyes 40% of the way down it.
      val faces = found.take(count).filterNotNull().map { face ->
        face.getMidPoint(eyes)
        val distance = face.eyesDistance().toDouble()
        val w = distance * 2.2
        val h = distance * 2.9
        mapOf("x" to (eyes.x - w / 2) / width, "y" to (eyes.y - h * 0.4) / height, "width" to w / width, "height" to h / height)
      }
      mapOf("width" to width, "height" to height, "faces" to faces)
    }
  }

  private companion object {
    const val MAX_FACES = 8
  }
}
