import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/src/stores/useAuthStore";
import { useRouter } from "expo-router";

const avatarImage = require("../../../../assets/avatar/otterPrimaryBG.png");

export default function ProfileScreen() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="relative mb-16">
          <View className="h-48 bg-primary w-full justify-between p-6 pt-12 flex-row items-start"></View>
          <View className="absolute -bottom-14 self-center">
            <View className="w-28 h-28 rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom">
              <Image
                source={avatarImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="absolute bottom-0 right-0 bg-secondary px-2 py-0.5 rounded-full border-2 border-background">
              <Text className="text-white text-tiny font-bold">🎓 8</Text>
            </View>
          </View>
        </View>

        <View className="items-center px-4 mb-8">
          <View className="flex-row items-center gap-2">
            <Text className="text-h3 font-bold text-text">
              {user?.username || "Guest User"}
            </Text>
            <View className="bg-alert px-2 py-0.5 rounded-full">
              <Text className="text-text text-tiny font-bold">🔥 12</Text>
            </View>
          </View>

          <Text className="text-body text-gray-500 mt-1">
            {user?.email || "user@example.com"}
          </Text>
        </View>

        <View className="px-6 mt-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full border border-alert bg-background rounded-full py-3 items-center"
          >
            <Text className="text-alert font-bold text-body">ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
