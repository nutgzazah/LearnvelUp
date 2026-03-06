import { AppIcons } from "@/src/constants/icons";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Redirect, Stack } from "expo-router";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";
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
                <Image
                  source={AppIcons.HEADERS.NORMAL.BACK[theme]}
                  className="w-7 h-7"
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center px-1">
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-5 h-5 mx-1"
              />
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
        options={({ navigation }) => ({
          title: "ผู้สอน",
          headerLeft: () => (
            <View className="items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={AppIcons.HEADERS.NORMAL.BACK[theme]}
                  className="w-7 h-7"
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center px-1">
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-5 h-5 mx-1"
              />
              <Text className="text-small font-bold text-text">0</Text>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: true,
          headerBackground() {
            return <View className="bg-background absolute inset-0" />;
          },
          headerTitleStyle: {
            fontSize: 19,
            color: "rgb(var(--color-text) / <alpha-value>)",
            fontFamily: "K2D-Regular",
          },
        })}
      />
      <Stack.Screen
        name="profile/wishlist"
        options={({ navigation }) => ({
          title: "คอร์สที่อยากได้",
          headerLeft: () => (
            <View className="items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={AppIcons.HEADERS.NORMAL.BACK[theme]}
                  className="w-7 h-7"
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center px-1">
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-5 h-5 mx-1"
              />
              <Text className="text-small font-bold text-text">0</Text>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: true,
          headerSearchBarOptions: {
            placeholder: "ค้นหาคอร์สที่อยากได้",
            onChangeText: (text) => console.log("Search"),
          },
          headerBackground() {
            return <View className="bg-background absolute inset-0" />;
          },
          headerTitleStyle: {
            fontSize: 19,
            color: "rgb(var(--color-text) / <alpha-value>)",
            fontFamily: "K2D-Regular",
          },
        })}
      />
      <Stack.Screen
        name="profile/achieve"
        options={({ navigation }) => ({
          title: "เหรียญตราความสำเร็จ",
          headerLeft: () => (
            <View className="items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={AppIcons.HEADERS.NORMAL.BACK[theme]}
                  className="w-7 h-7"
                />
              </TouchableOpacity>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: true,
          headerSearchBarOptions: {
            placeholder: "ค้นหาเหรียญตราความสำเร็จ",
            onChangeText: (text) => console.log("Search"),
          },
          headerBackground() {
            return <View className="bg-background absolute inset-0" />;
          },
          headerTitleStyle: {
            fontSize: 19,
            color: "rgb(var(--color-text) / <alpha-value>)",
            fontFamily: "K2D-Regular",
          },
        })}
      />
      <Stack.Screen
        name="profile/achieveReward/[id]"
        options={{
          presentation: "card", // หรือ "modal" ทำให้เด้งขึ้นมาจากข้างล่าง (iOS style)
          headerShown: false,
          title: "รับรางวัล",
        }}
      />
      <Stack.Screen
        name="profile/editProfile"
        options={({ navigation }) => ({
          title: "แก้ไขโปรไฟล์",
          headerLeft: () => (
            <View className="items-center">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={AppIcons.HEADERS.NORMAL.BACK[theme]}
                  className="w-7 h-7"
                />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center px-1">
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-5 h-5 mx-1"
              />
              <Text className="text-small font-bold text-text">0</Text>

              <Image
                source={AppIcons.HEADERS.NORMAL.STREAK}
                className="w-5 h-5 mx-1 ml-2"
              />
              <Text className="text-small font-bold text-text">0</Text>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: true,
          headerBackground() {
            return <View className="bg-background absolute inset-0" />;
          },
          headerTitleStyle: {
            fontSize: 19,
            color: "rgb(var(--color-text) / <alpha-value>)",
            fontFamily: "K2D-Regular",
          },
        })}
      />
    </Stack>
  );
}
