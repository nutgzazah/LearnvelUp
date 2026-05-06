import { useRecommendationStore } from "@/src/stores/recommendationStore";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppIcons } from "../constants/icons";
import RecommendedCourseCard from "./RecommendedCourseCard";

interface Props {
  userId: string;
  showScore?: boolean; // dev mode
}

const RecommendedSection = ({ userId, showScore = false }: Props) => {
  const { courses, loading, error, isColdStart, fetch } =
    useRecommendationStore();

  // log userId
  useEffect(() => {
    console.log("userId ที่ส่งไป recommend:", userId);
    if (userId) fetch(userId);
  }, [userId]);

  // ── Loading ──
  if (loading) {
    return (
      <View className="px-4 py-6 items-center">
        <ActivityIndicator color="#4F46E5" />
        <Text className="text-disabletext font-regular text-small mt-2">
          กำลังโหลดคอร์สแนะนำ...
        </Text>
      </View>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <View className="px-4 py-4">
        <Text className="text-alert font-regular text-tiny text-center">
          ไม่สามารถโหลดคอร์สแนะนำได้
        </Text>
        <Text className="text-alert font-regular text-tiny text-center mt-1">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => fetch(userId)}
          className="mt-2 items-center"
        >
          <Text className="text-primary font-bold text-tiny">ลองใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Empty ──
  if (!courses.length) return null;

  return (
    <View className="mt-6">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View>
          <View className="flex-row items-center ">
            <Text className="text-text font-regular text-h6 ">
              {isColdStart ? "คอร์สยอดนิยม" : "แนะนำสำหรับคุณ"}
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.RECOMMEND}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          <Text className="text-disabletext font-regular text-small mt-0.5">
            {isColdStart
              ? "เรียนคอร์สแรกเพื่อรับคำแนะนำส่วนตัว"
              : `${courses.length} คอร์สที่เหมาะกับคุณ`}
          </Text>
        </View>

        {/* Personalized badge */}
        {!isColdStart && (
          <View className="flex-row items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
            <Text className="text-primary font-regular text-tiny">✨ AI</Text>
          </View>
        )}
      </View>

      {/* ── Scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {courses.map((course) => (
          <RecommendedCourseCard
            key={course.course_id}
            course={course}
            /*showScore={showScore}*/
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default RecommendedSection;
