// @ts-ignore
import '../global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { AuthProvider } from '../features/auth/AuthProvider';
import { LogBox } from 'react-native';

// Ignore internal Reanimated warnings from Expo Router
LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
  '[Reanimated] Writing to `value` during component render',
  '@firebase/firestore: Firestore (12.16.0): WebChannelConnection',
  '@firebase/firestore: Firestore (12.16.0): BloomFilter error',
]);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="video/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
