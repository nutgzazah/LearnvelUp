import { useAuthStore } from "@/src/stores/useAuthStore";
import { Redirect, Stack } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import backIcon from "../../../assets/images/back-icon.png";
import coinIcon from "../../../assets/images/coin-icon.png";

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
        options={({ navigation }) => ({
          title: "คอร์สเรียน",
          headerLeft: () => (
            <View className="items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={backIcon} className="w-7 h-7" />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center px-1">
              <Image source={coinIcon} className="w-5 h-5 mx-1" />
              <Text className="text-small font-bold text-text">0</Text>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: true,
          headerBackground() {
            return <View className="bg-background absolute inset-0" />;
          },
          /* headerStyle: {
            backgroundColor: "rgb(var(--color-background) / <alpha-value>)",
          }, */
          headerTitleStyle: {
            fontSize: 19,
            color: "rgb(var(--color-text) / <alpha-value>)",
            fontFamily: "K2D-Regular",
          },
        })}
      />
      <Stack.Screen
        name="course/teacher/[id]"
        options={{
          presentation: "card", // หรือ "modal" ทำให้เด้งขึ้นมาจากข้างล่าง (iOS style)
          headerShown: false,
          title: "",
        }}
      />
    </Stack>
  );
}
