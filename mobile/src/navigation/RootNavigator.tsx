import TabNavigator from './TabNavigator';
import type { WidgetDeepLinkTarget } from '@/widgets/deepLink';

export default function RootNavigator({
  initialWidgetTarget,
}: {
  initialWidgetTarget?: WidgetDeepLinkTarget | null;
}) {
  return <TabNavigator initialWidgetTarget={initialWidgetTarget} />;
}
