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
      <Stack.Screen
        name="missionReward/[id]"
        options={{
          presentation: "card", // หรือ "modal" ทำให้เด้งขึ้นมาจากข้างล่าง (iOS style)
          headerShown: false,
          title: "รับรางวัล",
        }}
      />
      <Stack.Screen
        name="home/[id]"
        options={{
          presentation: "card", // หรือ "modal" ทำให้เด้งขึ้นมาจากข้างล่าง (iOS style)
          headerShown: false,
          title: "",
        }}
      />
      <Stack.Screen
        name="course/[id]"
        options={{
          presentation: "card", // หรือ "modal" ทำให้เด้งขึ้นมาจากข้างล่าง (iOS style)
          headerShown: false,
          title: "",
        }}
      />
    </Stack>
  );
}
