import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HnkAuthProvider } from '../features/auth/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HnkAuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#030406' },
          }}
        />
      </HnkAuthProvider>
    </SafeAreaProvider>
  );
}
