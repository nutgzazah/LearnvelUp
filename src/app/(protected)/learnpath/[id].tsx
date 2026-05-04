import CourseStageCard from "@/src/components/CourseStageCard";
import { supabase } from "@/src/lib/supabase";
import {
    enrollUserInLearningPath,
    getLearningPathById,
    getLearningPathCourses,
    getUserEnrollmentsForPath,
    getUserLearningPathCourseStatuses,
    LearningPath,
    LearningPathCourseItem,
    UserEnrollment,
    UserLearningPath,
} from "@/src/services/learnpathService";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UnlockStatus = {
  learning_path_course_id: number;
  is_unlocked: boolean;
  is_completed: boolean;
};

export default function LearningPathDetailPage() {
  const { id } = useLocalSearchParams();

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathCourses, setPathCourses] = useState<LearningPathCourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [unlockStatuses, setUnlockStatuses] = useState<UnlockStatus[]>([]);
  const [userLearningPath, setUserLearningPath] = useState<UserLearningPath | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function handleEnroll() {
    if (!userId) {
        Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนลงทะเบียน");
        return;
    }
    if (!learningPath) return;

    try {
        setEnrolling(true);
        const result = await enrollUserInLearningPath(userId, learningPath.id);
        setUserLearningPath(result);
        Alert.alert("สำเร็จ", "ลงทะเบียนเส้นทางการเรียนเรียบร้อยแล้ว");
    } catch (error) {
        console.log("Enroll error:", error);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
        setEnrolling(false);
    }
   }

  useEffect(() => {
  async function loadLearningPath() {
    try {
      setLoading(true);
      const pathId = Number(id);
      if (!pathId) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      setUserId(uid ?? null); // <-- เพิ่มบรรทัดนี้

      const [data, courses] = await Promise.all([
        getLearningPathById(pathId),
        getLearningPathCourses(pathId),
      ]);

      setLearningPath(data);
      setPathCourses(courses);

      if (uid && courses.length > 0) {
        const courseIds = courses.map((c) => c.course_id);

        const [enrollmentData, unlockData, existingPath] = await Promise.all([
          getUserEnrollmentsForPath(uid, courseIds),
          getUserLearningPathCourseStatuses(uid, pathId),
          // ดึงสถานะ user_learning_paths ที่มีอยู่
          supabase
            .from("user_learning_paths")
            .select("*")
            .eq("user_id", uid)
            .eq("learning_path_id", pathId)
            .maybeSingle(),
        ]);

        setEnrollments(enrollmentData);
        setUnlockStatuses(unlockData);
        setUserLearningPath((existingPath.data as UserLearningPath) ?? null);
      }
    } catch (error) {
      console.log("Load learning path detail error:", error);
      setLearningPath(null);
      setPathCourses([]);
    } finally {
      setLoading(false);
    }
  }

  loadLearningPath();
}, [id]);


  // Helper: หาสถานะของแต่ละคอร์ส
  function getCourseStatus(item: LearningPathCourseItem): "locked" | "unlocked" | "enrolled" | "completed" {
    const unlockInfo = unlockStatuses.find(
        (u) => u.learning_path_course_id === item.id
    );
    const enrollment = enrollments.find((e) => e.course_id === item.course_id);

    // ถ้า unlock_type เป็น always_unlocked หรือไม่มี record ใน user_learning_path_courses
    // ให้ถือว่าปลดล็อกแล้ว
    const isUnlocked =
        item.unlock_type === "always_unlocked" ||
        unlockInfo?.is_unlocked === true;

    if (!isUnlocked) return "locked";
    if (enrollment?.is_completed) return "completed";
    if (enrollment) return "enrolled";
    return "unlocked";
    }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text font-regular text-body">กำลังโหลด...</Text>
      </SafeAreaView>
    );
  }

  if (!learningPath) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-text font-regular text-body text-center">
          ไม่พบเส้นทางการเรียนนี้
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "เส้นทางการเรียนรู้",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-4">
            <Text className="text-text font-bold text-h5 mt-4 mb-4 ml-2">{learningPath.title}</Text>

            <View className="bg-card rounded-[20px] p-2 shadow-sm">
              <Image
                source={{
                  uri: learningPath.cover_image_url || "https://via.placeholder.com/800x450",
                }}
                className="w-full h-[220px] rounded-[15px]"
                resizeMode="cover"
              />
            </View>

            <View className="bg-card rounded-[15px] p-4 mt-4 shadow-sm">
              <Text className="text-text font-regular text-body leading-7">
                {learningPath.description || "ยังไม่มีรายละเอียดเส้นทางการเรียน"}
              </Text>
            </View>

{/* Course Stages */}
<View className="mt-8 mb-8">
  {pathCourses.map((item, index) => {
    const course = item.course;
    if (!course) return null;

    const status = getCourseStatus(item);

    const progressPercent = 0;

    return (
      <View key={item.id}>
        <CourseStageCard
          courseImage={{
            uri: course.cover_image_url || "https://via.placeholder.com/340x190",
          }}
          avatarImage={{
            uri: course.instructors?.avatar_url || "https://via.placeholder.com/100",
          }}
          courseName={course.title}
          coins={course.price_coins ?? 0}
          sequenceOrder={item.sequence_order}
          isRequired={item.is_required}
          status={status}
          progressPercent={progressPercent}
          onPress={() => {
            if (status !== "locked") {
              router.push(`/(protected)/course/${course.id}` as any);
            }
          }}
          showTopConnector={index !== 0}
          showBottomConnector={index !== pathCourses.length - 1}
        />

       
      </View>
    );
  })}
</View>

          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-background border-t border-gray-200">
            <TouchableOpacity
                className={`w-full rounded-xl py-4 items-center justify-center my-2 ${
                userLearningPath ? "bg-gray-400" : "bg-primary"
                }`}
                onPress={handleEnroll}
                disabled={!!userLearningPath || enrolling}
            >
                <Text className="text-white font-bold text-body text-center">
                {enrolling
                    ? "กำลังลงทะเบียน..."
                    : userLearningPath
                    ? "ลงทะเบียนแล้ว"
                    : "ลงทะเบียนเส้นทางเรียน"}
                </Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}