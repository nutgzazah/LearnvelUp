import { useAuthStore } from "@/src/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme("light");
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* ---( Section: ลักษณะที่ปรากฏ )--- */}
      <Text className="text-disabletext font-bold text-small mb-2 ml-2 uppercase">
        ลักษณะที่ปรากฏ ( Appearance )
      </Text>
      <View className="bg-card rounded-2xl border border-disablebg/10 overflow-hidden mb-6">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons
              name={colorScheme === "dark" ? "moon" : "sunny"}
              size={22}
              color={colorScheme === "dark" ? "#6366f1" : "#f59e0b"}
            />
            <Text className="text-text font-regular text-body">
              โหมดกลางคืน (Dark Mode)
            </Text>
          </View>
          <Switch
            value={colorScheme === "dark"}
            onValueChange={toggleColorScheme}
            trackColor={{ false: "#d1d5db", true: "#6366f1" }}
            thumbColor={"#ffffff"}
          />
        </View>
      </View>

      {/* ---( Section: บัญชี )--- */}
      <Text className="text-disabletext font-bold text-small mb-2 ml-2 uppercase">
        บัญชีผู้ใช้ ( Account )
      </Text>
      <View className="bg-card rounded-2xl border border-disablebg/10 overflow-hidden">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text className="text-alert font-bold text-body">
              ออกจากระบบ (Log Out)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
