// launchTrace MUST be the first import in the bundle: its module body captures
// t0, so every later number is relative to "our JS started". TEMPORARY — see
// src/utils/launchTrace.ts.
import { launchMark, startLaunchTrace } from './src/utils/launchTrace';
import { registerRootComponent } from 'expo';

import App from './App';

// Reached only after every static import above — including App's entire graph —
// has been evaluated, so this mark IS the bundle-evaluation cost.
launchMark('bundle-evaluated');
startLaunchTrace();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
launchMark('root-registered');
