import SecureVideoPlayer from "@/src/components/SecureVideoPlayer";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CourseExampleScreen() {
  const router = useRouter();

  const mockChapter = {
    id: 1,
    title: "บทที่ 1: ปฐมนิเทศนักผจญภัย",
    video_url: "courses/1/chapters/1.mp4",
    duration_seconds: 300,
    reward_xp: 50,
    reward_coins: 10,
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 pb-4 px-6 bg-primary flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-h4 font-bold text-white flex-1" numberOfLines={1}>
          {mockChapter.title}
        </Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* use SecureVideoPlayer component */}
        <SecureVideoPlayer videoPath={mockChapter.video_url} />

        <View className="mt-6 p-4 bg-card rounded-xl border border-border shadow-custom">
          <Text className="text-h4 font-bold text-text mb-2">
            {mockChapter.title}
          </Text>

          <View className="flex-row items-center gap-4 mt-2">
            <View className="flex-row items-center gap-1">
              <Feather name="clock" size={16} color="#9CA3AF" />
              <Text className="text-body text-disabletext">
                {Math.floor(mockChapter.duration_seconds / 60)} นาที
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-body font-bold text-secondary">
                ⭐ +{mockChapter.reward_xp} XP
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-body font-bold text-[#F59E0B]">
                💰 +{mockChapter.reward_coins}
              </Text>
            </View>
          </View>

          <Text className="text-body text-text mt-4">
            ในบทเรียนนี้ คุณจะได้เรียนรู้พื้นฐานการใช้งานระบบ
            และเตรียมความพร้อมก่อนออกผจญภัยในโลกของ LearnvelUp!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
