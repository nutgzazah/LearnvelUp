import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import "../../global.css";

import { verifyServerSession } from "../services/authService";
import { useAuthStore } from "../stores/useAuthStore";

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "K2D-Regular": require("../../assets/fonts/K2D-Regular.ttf"),
    "K2D-Medium": require("../../assets/fonts/K2D-Medium.ttf"),
    "K2D-Bold": require("../../assets/fonts/K2D-Bold.ttf"),
    "K2D-Italic": require("../../assets/fonts/K2D-Italic.ttf"),
    "K2D-MediumItalic": require("../../assets/fonts/K2D-MediumItalic.ttf"),
    "K2D-BoldItalic": require("../../assets/fonts/K2D-BoldItalic.ttf"),
  });

  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkSession = async () => {
      const { isValid } = await verifyServerSession();

      if (!isValid) {
        await logout();
      }
    };

    checkSession();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
