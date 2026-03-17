import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
          <Stack.Screen name="records/add" options={{ title: 'Add Climb' }} />
          <Stack.Screen name="records/[id]" options={{ title: 'Climb Details' }} />
          <Stack.Screen name="payment/payment" options={{ title: 'Payment' }} />
          <Stack.Screen name="payment/success" options={{ title: 'Success' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
