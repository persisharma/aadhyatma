// Phosphor's native SVG adapter also supports web's className prop.
import 'react-native-svg';
declare module 'react-native-svg' {
  interface SvgProps { className?: string }
}
