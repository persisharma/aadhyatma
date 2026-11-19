#include <yoga/Yoga.h>
#include <cmath>
#include <iostream>
#include <stdexcept>

void check(bool ok, const char* message) {
  if (!ok) throw std::runtime_error(message);
}

// Same Yoga sources shipped by the installed React Native package. This proves
// layout constraints, not installed-screen drawing, fonts or native navigation.
int main() {
  int count = 0;
  for (float density : {1.0f, 2.0f, 2.75f, 3.0f}) {
    for (float width : {276.0f, 316.0f, 346.0f, 347.2f, 384.0f, 600.0f}) {
      auto config = YGConfigNew();
      YGConfigSetPointScaleFactor(config, density);
      auto root = YGNodeNewWithConfig(config);
      YGNodeStyleSetWidth(root, width);
      auto image = YGNodeNewWithConfig(config);
      // RN Image merges {width: source.width, height: source.height} first.
      // The old width:100% and aspectRatio do not unset height:640.
      YGNodeStyleSetWidthPercent(image, 100);
      YGNodeStyleSetHeight(image, 640);
      YGNodeStyleSetAspectRatio(image, 1.5f);
      YGNodeInsertChild(root, image, 0);
      YGNodeCalculateLayout(root, YGUndefined, YGUndefined, YGDirectionLTR);
      check(std::abs(YGNodeLayoutGetHeight(image) - 640) < 0.01f,
            "legacy image should reproduce the 640dp intrinsic height");
      YGNodeFreeRecursive(root);

      root = YGNodeNewWithConfig(config);
      YGNodeStyleSetWidth(root, width);
      auto frame = YGNodeNewWithConfig(config);
      YGNodeStyleSetWidthPercent(frame, 100);
      YGNodeStyleSetAspectRatio(frame, 1.5f);
      YGNodeStyleSetFlexShrink(frame, 0);
      image = YGNodeNewWithConfig(config);
      YGNodeStyleSetPositionType(image, YGPositionTypeAbsolute);
      YGNodeStyleSetPosition(image, YGEdgeLeft, 0);
      YGNodeStyleSetPosition(image, YGEdgeTop, 0);
      YGNodeStyleSetWidthPercent(image, 100);
      YGNodeStyleSetHeightPercent(image, 100);
      YGNodeInsertChild(frame, image, 0);
      YGNodeInsertChild(root, frame, 0);
      YGNodeCalculateLayout(root, YGUndefined, YGUndefined, YGDirectionLTR);
      const auto frameWidth = YGNodeLayoutGetWidth(frame);
      const auto frameHeight = YGNodeLayoutGetHeight(frame);
      const auto tolerance = 1.0f / density + 0.01f;
      check(std::abs(frameHeight - frameWidth / 1.5f) <= tolerance,
            "frame must keep 3:2 at native pixel rounding");
      check(std::abs(YGNodeLayoutGetHeight(image) - frameHeight) <= tolerance,
            "image must fit frame height rather than source height");
      check(std::abs(YGNodeLayoutGetWidth(image) - frameWidth) <= tolerance,
            "image must fit frame width rather than source width");
      YGNodeFreeRecursive(root);
      YGConfigFree(config);
      count++;
    }
  }
  std::cout << "PASS: " << count << " native Yoga cases; old intrinsic-height defect reproduced, fixed 3:2 frames preserved.\n";
}
