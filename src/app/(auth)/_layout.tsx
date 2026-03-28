import { useAuthStore } from "@/src/stores/useAuthStore";
import { Redirect, Stack, useRootNavigationState } from "expo-router";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);

  const rootNavigationState = useRootNavigationState();
  if (!rootNavigationState?.key) return null;

  // Check Profile Completeness and Redirect accordingly
  if (isAuthenticated) {
    return isProfileComplete ? (
      <Redirect href="/(protected)/(tabs)" />
    ) : (
      <Redirect href="/(protected)/onboarding" />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
