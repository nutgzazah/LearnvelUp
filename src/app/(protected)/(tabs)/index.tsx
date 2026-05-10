import CardLearnPath from "@/src/components/CardLearnPath";
import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { AppIcons } from "@/src/constants/icons";
import { getHomeCoursesData } from "@/src/services/course-service";
import {
  getLearningPaths,
  LearningPath,
} from "@/src/services/learnpathService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const LOADING_ANIM = require("../../../../assets/json/loadingOtter.json");

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // ✨ Use TanStack Query
  const { data: homeData, isLoading } = useQuery({
    queryKey: ["homeCourses", user?.id],
    queryFn: () => getHomeCoursesData(user?.id || null),
  });

  // Learning Path
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
        {/* 1. แนะนำสำหรับคุณ (เว้นว่างไว้ก่อนตามสั่ง) */}
        <View>
          <View className="flex-row mt-6 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              แนะนำสำหรับคุณ
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.RECOMMEND}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          {/* เว้นว่างเนื้อหาไว้ก่อน */}
          <View className="h-10" />
        </View>

        {/* 2. เส้นทางการเรียนที่แนะนำ (ฟังก์ชันที่เพื่อนยังทำไม่เสร็จ) */}
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

        {/* 3. คอร์สใหม่ล่าสุด (6 คอร์ส) */}
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

        {/* 4. คอร์สยอดนิยม (Enroll เยอะสุด 6 คอร์ส - ย้ายขึ้นมาต่อจากคอร์สใหม่) */}
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

        {/* 5. คอร์สทั้งหมดแบ่งตามหมวดหมู่ (ดึงตามความสนใจ 3 หมวด หมวดละ 4 คอร์ส) */}
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
              {/* ✨ กดที่ชื่อหมวดหมู่ แล้วเด้งไปหน้าค้นหาพร้อมส่งคำค้นหาไปให้ */}
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
    </View>
  );
}
