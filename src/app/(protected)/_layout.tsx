import { useAuthStore } from "@/src/stores/useAuthStore";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href={"/login"} />;
  }
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
