import { useUserStats } from "@/src/hook/useUserStats";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function EnergyModalScreen() {
  const router = useRouter();
  const { data: stats } = useUserStats();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-6 p-2 bg-card rounded-full shadow-sm"
      >
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <View className="w-64 h-64 mb-6">
        <LottieView
          source={require("@/assets/json/levelUp.json")}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <Text className="text-h1 font-black text-primary mb-2">
        {stats?.energy || 0} <Text className="text-h4 text-text/50">/ 20</Text>
      </Text>
      <Text className="text-h4 font-bold text-text mb-4">พลังงาน</Text>

      <Text className="text-body text-text/70 text-center leading-relaxed px-4 mb-8">
        พลังงานจำเป็นสำหรับการเข้าทำควิซในแต่ละบทเรียน
        หากพลังงานหมดจะไม่สามารถทำควิซได้นะ
      </Text>

      <View className="bg-card w-full p-5 rounded-3xl border border-primary/20 shadow-sm">
        <Text className="text-body font-bold text-primary mb-3">
          การฟื้นฟูพลังงาน:
        </Text>
        <View className="gap-2">
          <Text className="text-small text-text/80">
            • ฟื้นฟูอัตโนมัติ 1 หน่วย ทุกๆ 10 นาที
          </Text>
          <Text className="text-small text-text/80">
            • เติมเต็ม 100% ทันทีเมื่อคุณเลเวลอัป!
          </Text>
          <Text className="text-small text-text/80">
            • ได้รับเป็นรางวัลพิเศษจากบางภารกิจ
          </Text>
        </View>
      </View>
    </View>
  );
}
