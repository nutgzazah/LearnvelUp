import CardLearnPath from "@/src/components/CardLearnPath";
import { getLearningPaths } from "@/src/services/learnpathService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function AllLearningPathsScreen() {
  const router = useRouter();

  // ดึงข้อมูลเส้นทางการเรียนทั้งหมดจาก Database
  const { data: paths, isLoading } = useQuery({
    queryKey: ["allLearningPaths"],
    queryFn: getLearningPaths,
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
        <Text className="text-h4 font-bold text-text mb-6">
          เส้นทางการเรียนทั้งหมด
        </Text>

        {paths?.length === 0 ? (
          <Text className="text-center text-disabletext mt-10">
            ยังไม่มีเส้นทางการเรียนในระบบ
          </Text>
        ) : (
          <View className="gap-4">
            {paths?.map((path) => (
              <View key={path.id} className="w-full">
                <CardLearnPath
                  coverImage={{
                    uri:
                      path.cover_image_url ||
                      "https://via.placeholder.com/390x190",
                  }}
                  title={path.title}
                  courseCount={path.course_count}
                  onPress={() => router.push(`/learnpath/${path.id}` as any)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
