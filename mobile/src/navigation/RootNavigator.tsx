import TabNavigator from './TabNavigator';
import type { StartTarget } from './startTarget';

export default function RootNavigator({
  initialTarget,
}: {
  initialTarget?: StartTarget | null;
}) {
  return <TabNavigator initialTarget={initialTarget} />;
}
