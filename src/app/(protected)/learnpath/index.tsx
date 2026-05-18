// ไฟล์: src/app/(protected)/learnpath/index.tsx
import CardLearnPath from "@/src/components/CardLearnPath";
import { getUserEnrolledLearningPaths } from "@/src/services/learnpathService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function MyLearningPathsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // ดึงเฉพาะเส้นทางการเรียนที่ User ลงทะเบียนไว้แล้ว
  const { data: enrolledPaths, isLoading } = useQuery({
    queryKey: ["myEnrolledLearningPaths", user?.id],
    queryFn: () => getUserEnrolledLearningPaths(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {!enrolledPaths || enrolledPaths.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-center text-text font-bold text-h6 mb-2">
              ยังไม่ได้ลงทะเบียนเส้นทางใดๆ
            </Text>
            <Text className="text-center text-disabletext text-body px-4">
              คุณสามารถดู "เส้นทางการเรียนทั้งหมด"
              ในหน้าแรกเพื่อเลือกเส้นทางที่สนใจได้
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {enrolledPaths.map((item) => (
              <View key={item.id} className="w-full">
                <CardLearnPath
                  coverImage={{
                    uri:
                      item.learning_path.cover_image_url ||
                      "https://via.placeholder.com/390x190",
                  }}
                  title={item.learning_path.title}
                  courseCount={item.learning_path.course_count}
                  onPress={() =>
                    router.push(`/learnpath/${item.learning_path_id}` as any)
                  }
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
