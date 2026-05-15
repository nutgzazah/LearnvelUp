import CardLearnPath from "@/src/components/CardLearnPath";
import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import RecommendedSection from "@/src/components/RecommendedSection";
import { AppIcons } from "@/src/constants/icons";
import { useUserStats } from "@/src/hook/useUserStats";
import { getHomeCoursesData } from "@/src/services/course-service";
import {
  getLearningPaths,
  LearningPath,
} from "@/src/services/learnpathService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { claimWelcomeBonus } from "@/src/services/userService";
import { useAudioPlayer } from "expo-audio";

const LOADING_ANIM = require("../../../../assets/json/loadingOtter.json");
const WELCOME_SOUND = require("@/assets/sounds/welcome.mp3");

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: userStats } = useUserStats();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isClaimingWelcome, setIsClaimingWelcome] = useState(false);

  const welcomeSound = useAudioPlayer(WELCOME_SOUND);

  useEffect(() => {
    if (userStats && userStats.welcome_bonus_claimed === false) {
      setShowWelcomePopup(true);
      welcomeSound.seekTo(0);
      welcomeSound.play();
    }
  }, [userStats?.welcome_bonus_claimed]);

  const handleClaimWelcomeBonus = async () => {
    if (!user?.id) return;
    setIsClaimingWelcome(true);
    try {
      const data = await claimWelcomeBonus(user.id);

      const result = data as any;

      if (result && !result.success) {
        throw new Error(result.message);
      }

      await queryClient.invalidateQueries({ queryKey: ["userStats", user.id] });
      setShowWelcomePopup(false);
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถรับรางวัลได้");
    } finally {
      setIsClaimingWelcome(false);
    }
  };

  const { data: homeData, isLoading } = useQuery({
    queryKey: ["homeCourses", user?.id],
    queryFn: () => getHomeCoursesData(user?.id || null),
  });

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const paths = await getLearningPaths();
        setLearningPaths(paths);
      } catch (error) {
        console.error("Error fetching learning paths:", error);
      }
    };
    fetchLearningPaths();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LottieView
          source={LOADING_ANIM}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">
          กำลังเตรียมหน้าโฮม...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView>
          {user && <RecommendedSection userId={user?.id} />}
        </ScrollView>

        <View>
          <View className="flex-row mt-2 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              เส้นทางการเรียนที่แนะนำ
            </Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {learningPaths.map((path) => (
              <CardLearnPath
                key={path.id}
                coverImage={{
                  uri:
                    path.cover_image_url ||
                    "https://via.placeholder.com/340x190",
                }}
                title={path.title}
                courseCount={path.course_count}
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/learnpath/[id]",
                    params: { id: String(path.id) },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        <View>
          <View className="flex-row mt-2 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สใหม่ล่าสุด
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.HOT}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {homeData?.newestCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                courseImage={{
                  uri:
                    course.cover_image_url || "https://via.placeholder.com/150",
                }}
                avatarImage={{
                  uri:
                    course.instructors?.avatar_url ||
                    "https://via.placeholder.com/150",
                }}
                courseName={course.title}
                coins={course.price_coins}
                onPress={() =>
                  router.push(`/(protected)/course/${course.id}` as any)
                }
              />
            ))}
          </ScrollView>
        </View>

        <View>
          <View className="flex-row mt-4 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
            <Image
              source={AppIcons.HOME.NORMAL.POPULAR}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {homeData?.popularCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                courseImage={{
                  uri:
                    course.cover_image_url || "https://via.placeholder.com/150",
                }}
                avatarImage={{
                  uri:
                    course.instructors?.avatar_url ||
                    "https://via.placeholder.com/150",
                }}
                courseName={course.title}
                coins={course.price_coins}
                onPress={() =>
                  router.push(`/(protected)/course/${course.id}` as any)
                }
              />
            ))}
          </ScrollView>
        </View>

        <View className="mt-4 px-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-text font-regular text-h6">
              คอร์สแบ่งตามหมวดหมู่
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.CATEGORY}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          {homeData?.categorySections.map((section: any) => (
            <View key={section.categoryId} className="mb-6">
              <View className="flex-row items-center justify-between mb-2 pr-2">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/search",
                      params: { q: section.categoryName },
                    })
                  }
                >
                  <Text className="text-primary font-bold text-body underline">
                    {section.categoryName}
                  </Text>
                </TouchableOpacity>
              </View>

              {section.courses.length > 0 ? (
                <CourseHorizontalList
                  courses={section.courses}
                  onPressItem={(course) =>
                    router.push(`/(protected)/course/${course.id}` as any)
                  }
                />
              ) : (
                <Text className="text-disabletext text-small italic">
                  ยังไม่มีคอร์สในหมวดหมู่นี้
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Popup ต้อนรับสมาชิกใหม่ (Modal Card) */}
      <Modal visible={showWelcomePopup} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-background w-full rounded-[20px] p-4 items-center shadow-custom ">
            <View className="h-60 justify-center">
              <LottieView
                source={LOADING_ANIM}
                autoPlay
                loop
                style={{ width: 190, height: 190 }}
              />
            </View>

            <Text className="text-h3 font-bold text-primary mb-4 text-center">
              ยินดีต้อนรับ!
            </Text>

            <Text className="text-body text-text text-center mb-6 leading-relaxed">
              รับของขวัญผู้ใช้ใหม่{" "}
              <Text className="text-secondary font-bold">500 เหรียญ</Text>{" "}
              สำหรับนำไปใช้ปลดล็อกคอร์สเรียนที่คุณสนใจได้เลย! 🦦
            </Text>

            <TouchableOpacity
              onPress={handleClaimWelcomeBonus}
              disabled={isClaimingWelcome}
              className="bg-primary w-full py-4 rounded-full flex-row justify-center items-center mb-2"
            >
              <Text className="text-white font-bold text-body">
                {isClaimingWelcome ? "กำลังรับรางวัล..." : "รับรางวัล"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
