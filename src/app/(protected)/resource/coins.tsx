import { AppIcons } from "@/src/constants/icons";
import { useUserStats } from "@/src/hook/useUserStats";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function CoinsModalScreen() {
  const router = useRouter();
  const { data: stats } = useUserStats();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* ปุ่มปิด */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-6 p-2 bg-card rounded-full shadow-sm"
      >
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <Image
        source={AppIcons.HEADERS.NORMAL.COIN}
        className="w-32 h-32 mb-6"
        resizeMode="contain"
      />

      <Text className="text-h1 font-black text-secondary mb-2">
        {stats?.coins || 0}
      </Text>
      <Text className="text-h4 font-bold text-text mb-4">เหรียญทอง</Text>

      <Text className="text-body text-text/70 text-center leading-relaxed px-4 mb-8">
        เหรียญทองคือสกุลเงินหลักใน LearnvelUp
        ใช้สำหรับซื้อคอร์สเรียนระดับพรีเมียมและไอเทมพิเศษต่างๆ
      </Text>

      <View className="bg-card w-full p-5 rounded-3xl border border-primary/20 shadow-sm">
        <Text className="text-body font-bold text-primary mb-3">
          วิธีหาเหรียญเพิ่ม:
        </Text>
        <View className="gap-2">
          <Text className="text-small text-text/80">
            • ทำควิซท้ายบทเรียนให้ผ่านครั้งแรก
          </Text>
          <Text className="text-small text-text/80">
            • ทำภารกิจรายวัน / รายสัปดาห์ให้สำเร็จ
          </Text>
          <Text className="text-small text-text/80">• กิจกรรมใหม่ๆในอนาคต</Text>
        </View>
      </View>
    </View>
  );
}
