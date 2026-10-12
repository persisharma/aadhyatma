import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { SquaresFourIcon } from 'phosphor-react-native/src/icons/SquaresFour';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { ShareNetworkIcon } from 'phosphor-react-native/src/icons/ShareNetwork';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import { PauseIcon } from 'phosphor-react-native/src/icons/Pause';
import { StopIcon } from 'phosphor-react-native/src/icons/Stop';
import { SkipBackIcon } from 'phosphor-react-native/src/icons/SkipBack';
import { SkipForwardIcon } from 'phosphor-react-native/src/icons/SkipForward';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { SunHorizonIcon } from 'phosphor-react-native/src/icons/SunHorizon';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { AlarmIcon } from 'phosphor-react-native/src/icons/Alarm';
import { BookmarkSimpleIcon } from 'phosphor-react-native/src/icons/BookmarkSimple';
import { UsersThreeIcon } from 'phosphor-react-native/src/icons/UsersThree';
import { FlowerIcon } from 'phosphor-react-native/src/icons/Flower';
import { GlobeHemisphereEastIcon } from 'phosphor-react-native/src/icons/GlobeHemisphereEast';
import { CalendarStarIcon } from 'phosphor-react-native/src/icons/CalendarStar';
import { TranslateIcon } from 'phosphor-react-native/src/icons/Translate';
import { TextAaIcon } from 'phosphor-react-native/src/icons/TextAa';
import { SpeakerHighIcon } from 'phosphor-react-native/src/icons/SpeakerHigh';
import { PaletteIcon } from 'phosphor-react-native/src/icons/Palette';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { InstagramLogoIcon } from 'phosphor-react-native/src/icons/InstagramLogo';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { FlagIcon } from 'phosphor-react-native/src/icons/Flag';
import { ArrowCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowCounterClockwise';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { IntersectIcon } from 'phosphor-react-native/src/icons/Intersect';
import { BabyIcon } from 'phosphor-react-native/src/icons/Baby';
import { PlanetIcon } from 'phosphor-react-native/src/icons/Planet';
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { LeafIcon } from 'phosphor-react-native/src/icons/Leaf';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { HandsPrayingIcon } from 'phosphor-react-native/src/icons/HandsPraying';
import { TreasureChestIcon } from 'phosphor-react-native/src/icons/TreasureChest';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { FirstAidKitIcon } from 'phosphor-react-native/src/icons/FirstAidKit';
import { FlagPennantIcon } from 'phosphor-react-native/src/icons/FlagPennant';
import { BirdIcon } from 'phosphor-react-native/src/icons/Bird';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import { GearSixIcon } from 'phosphor-react-native/src/icons/GearSix';

// Direct imports keep the full icon catalogue out of the launch bundle.
const icons = {
  search: MagnifyingGlassIcon,
  question: QuestionIcon,
  widgets: SquaresFourIcon,
  share: ShareNetworkIcon,
  heart: HeartIcon,
  back: ArrowLeftIcon,
  next: CaretRightIcon,
  close: XIcon,
  play: PlayIcon,
  pause: PauseIcon,
  stop: StopIcon,
  previous: SkipBackIcon,
  skip: SkipForwardIcon,
  repeat: RepeatIcon,
  home: HouseIcon,
  calendar: SunHorizonIcon,
  more: DotsThreeIcon,
  settings: GearSixIcon,
  bell: BellIcon,
  alarm: AlarmIcon,
  saved: BookmarkSimpleIcon,
  family: UsersThreeIcon,
  remembrance: FlowerIcon,
  regional: GlobeHemisphereEastIcon,
  birthday: CalendarStarIcon,
  language: TranslateIcon,
  textSize: TextAaIcon,
  voice: SpeakerHighIcon,
  theme: PaletteIcon,
  star: StarIcon,
  instagram: InstagramLogoIcon,
  info: InfoIcon,
  report: FlagIcon,
  reset: ArrowCounterClockwiseIcon,
  sun: SunIcon,
  moon: MoonIcon,
  match: IntersectIcon,
  name: BabyIcon,
  gochar: PlanetIcon,
  shield: ShieldCheckIcon,
  obstacles: LightningIcon,
  courage: FireIcon,
  peace: LeafIcon,
  insight: EyeIcon,
  devotion: HandsPrayingIcon,
  wealth: TreasureChestIcon,
  prosperity: PlantIcon,
  health: FirstAidKitIcon,
  victory: FlagPennantIcon,
  moksha: BirdIcon,
  auspicious: SparkleIcon,
  morning: SunHorizonIcon,
} as const;

export type AppIconName = keyof typeof icons;

/** Decorative artwork; the enclosing control owns its accessible label. */
export default function AppIcon({ name, size = 22, color, weight = 'regular' }: {
  name: AppIconName;
  size?: number;
  color?: string;
  weight?: 'regular' | 'fill' | 'duotone';
}) {
  const { colors } = useTheme();
  const Icon = icons[name];
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon size={size} color={color ?? colors.iconInk} weight={weight} />
    </View>
  );
}
