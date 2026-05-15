import { AppIcons } from "@/src/constants/icons";
import { useUserStats } from "@/src/hook/useUserStats";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { setUatStreakToThree } from "@/src/services/uatService";

export default function StreaksModalScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: stats } = useUserStats();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDevSetStreak = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      await setUatStreakToThree(user.id);

      await queryClient.invalidateQueries({ queryKey: ["userStats", user.id] });

      Alert.alert(
        "สำเร็จ (Dev Mode)",
        "เซ็ตสตรีคเป็น 3 และวันที่เป็นเมื่อวานเรียบร้อยแล้ว! ลองไปทำควิซเพื่อดูแอนิเมชันสตรีคเพิ่มเป็น 4 ได้เลย 🦦",
      );
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถอัปเดตสถิติได้");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-6 p-2 bg-card rounded-full shadow-sm"
      >
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <Image
        source={AppIcons.HEADERS.NORMAL.STREAK}
        className="w-32 h-32 mb-6"
        resizeMode="contain"
      />

      <Text className="text-h1 font-black text-alert mb-2">
        {stats?.streak || 0}
      </Text>
      <Text className="text-h4 font-bold text-text mb-4">สตรีคการเรียน</Text>

      <Text className="text-body text-text/70 text-center leading-relaxed px-4 mb-8">
        สตรีคแสดงถึงความสม่ำเสมอของคุณ ยิ่งสตรีคเยอะ
        ยิ่งพิสูจน์ว่าคุณเป็นคนขยันและมีวินัยมากแค่ไหน!
      </Text>

      <View className="bg-card w-full p-5 rounded-3xl border border-primary/20 shadow-sm mb-6">
        <Text className="text-body font-bold text-primary mb-3">
          🔥 กฎของการรักษาสตรีค:
        </Text>
        <View className="gap-2">
          <Text className="text-small text-text/80">
            • เข้าเรียนและทำควิซให้ผ่านอย่างน้อย 1 ครั้งต่อวัน
          </Text>
          <Text className="text-small text-text/80">
            • หากลืมเข้าเรียน 1 วัน สตรีคจะถูกรีเซ็ตกลับไปเป็น 0 ทันที!
          </Text>
          <Text className="text-small text-text/80">
            • การรักษาสตรีคต่อเนื่องจะช่วยปลดล็อกเหรียญตราพิเศษได้
          </Text>
        </View>
      </View>

      {/* 🛠️ ปุ่มสำหรับ UAT Test (Dev Tool) */}
      <TouchableOpacity
        onPress={handleDevSetStreak}
        disabled={isUpdating}
        className="w-full bg-alert/10 border border-alert/30 py-3 rounded-2xl flex-row justify-center items-center"
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <>
            <Ionicons
              name="hammer-outline"
              size={20}
              color="#EF4444"
              style={{ marginRight: 8 }}
            />
            <Text className="text-alert font-bold">
              UAT: เซ็ตสตรีคเป็น 3 (เมื่อวาน)
            </Text>
          </>
        )}
      </TouchableOpacity>
      <Text className="text-disabletext text-tiny mt-2 italic">
        * ปุ่มนี้ใช้สำหรับทดสอบระบบสตรีคเท่านั้น
      </Text>
    </View>
  );
}
