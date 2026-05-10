import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { AppIcons } from "../constants/icons";
import {
  enrollCourse,
  getCourseDetailData,
  toggleWishlist,
} from "../services/course-service";
import { useAuthStore } from "../stores/useAuthStore";

const LOADING_ANIM = require("../../assets/json/loadingOtter.json");

export default function CourseDetail() {
  const { id } = useLocalSearchParams();
  const courseId = Number(id) || 0;
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";

  const [activeTab, setActiveTab] = useState<
    "description" | "chapter" | "learning_outcome"
  >("chapter");

  // 1. ดึงข้อมูล
  const { data, isLoading } = useQuery({
    queryKey: ["courseDetail", courseId, user?.id],
    queryFn: () => getCourseDetailData(courseId, user?.id || null),
    enabled: !!courseId,
  });

  // 2. Mutations สำหรับ ซื้อคอร์ส
  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(courseId, user!.id),
    onSuccess: (res: any) => {
      if (res.success) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["courseDetail", courseId],
          });
          queryClient.invalidateQueries({
            queryKey: ["userStats", user?.id],
          });
        }, 300);
      } else {
        Alert.alert("แจ้งเตือน", res.message);
      }
    },
    onError: () => Alert.alert("ผิดพลาด", "ไม่สามารถซื้อคอร์สได้"),
  });

  // Mutation สำหรับกดหัวใจ
  const wishlistMutation = useMutation({
    mutationFn: () => toggleWishlist(courseId, data?.isWishlisted || false),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["courseDetail", courseId] }),
  });

  // 3. คำนวณชื่อหมวดหมู่
  const categoryNames = useMemo(() => {
    if (!data) return [];
    const { course, categories } = data;

    const getCatName = (cid?: number | null) => {
      if (!cid) return null;
      return categories.find((c: any) => c.id === cid)?.name;
    };

    return [
      getCatName(course.category_id),
      getCatName(course.sub_category_1_id),
      getCatName(course.sub_category_2_id),
    ].filter(Boolean) as string[];
  }, [data]);

  // 4. คำนวณสถานะของแต่ละตอน (Chapter Logic)
  const processedChapters = useMemo(() => {
    if (!data?.course?.chapters) return [];

    let isNextPlayableFound = false;

    return data.course.chapters.map((ch: any) => {
      if (!data.isEnrolled) return { ...ch, state: "locked" };

      const progress = data.chapterProgress.find(
        (p: any) => p.chapter_id === ch.id,
      );
      if (progress?.is_passed) {
        return { ...ch, state: "completed" };
      }

      if (!isNextPlayableFound) {
        isNextPlayableFound = true;
        return { ...ch, state: "playable" };
      }

      return { ...ch, state: "locked" };
    });
  }, [data]);

  // 5. คำนวณเวลารวมของคอร์ส (แปลงเป็น ชั่วโมง:นาที:วินาที)
  const formattedTotalDuration = useMemo(() => {
    const totalSeconds = processedChapters.reduce(
      (acc: number, ch: any) => acc + (ch.duration_seconds || 0),
      0,
    );

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    // ถ้าเกิน 1 ชั่วโมงให้แสดงหน่วยชั่วโมงด้วย
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ชม.`;
    }
    // ถ้าไม่ถึงชั่วโมง ให้แสดงแค่นาทีกับวินาที
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} นาที`;
  }, [processedChapters]);

  const getNextChapterIdToLearn = () => {
    const nextPlayable = processedChapters.find(
      (ch: any) => ch.state === "playable",
    );
    if (nextPlayable) return nextPlayable.id;
    return processedChapters[processedChapters.length - 1]?.id || "";
  };

  if (isLoading || !data) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LottieView
          source={LOADING_ANIM}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">
          กำลังเตรียมข้อมูลคอร์ส...
        </Text>
      </View>
    );
  }

  const { course, isWishlisted, isEnrolled } = data;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---(Course Thumbnail)--- */}
        <View className="items-center bg-black">
          <Image
            source={{
              uri:
                course.cover_image_url || "https://via.placeholder.com/400x220",
            }}
            className="w-full h-[220px]"
            resizeMode="cover"
            style={{ opacity: 0.8 }}
          />
        </View>

        {/* ---(Course Title + Category)--- */}
        <View className="px-4 mt-4">
          <Text className="text-h6 text-text font-bold leading-8">
            {course.title}
          </Text>
          <View className="flex-row flex-wrap mt-3">
            {categoryNames.map((name, index) => (
              <View
                key={index}
                className="bg-primary rounded-full px-4 py-1.5 mr-2 mb-2"
              >
                <Text className="text-white font-bold text-tiny">{name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---(Teacher + Learner Count)--- */}
        <View className="flex-row items-center justify-between px-4 mt-2">
          <TouchableOpacity
            onPress={() =>
              router.push(`/course/teacher/${course.instructors?.id}` as any)
            }
          >
            <View className="flex-row items-center gap-2">
              <Image
                source={{ uri: course.instructors?.avatar_url }}
                className="w-10 h-10 rounded-full"
              />
              <Text className="text-text font-bold text-body">
                {course.instructors?.username}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-1">
            <Text className="text-text font-bold text-small">
              ผู้เรียน {course.total_enrolled}
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.LEARNERS}
              className="w-6 h-6"
            />
          </View>
        </View>

        {/* ---(Tab Bar)--- */}
        <View className="flex-row mt-6 px-4 border-b border-gray-200 dark:border-gray-800">
          <TabButton
            title="บทเรียนทั้งหมด"
            isActive={activeTab === "chapter"}
            onPress={() => setActiveTab("chapter")}
          />
          <TabButton
            title="ผลการเรียนรู้"
            isActive={activeTab === "learning_outcome"}
            onPress={() => setActiveTab("learning_outcome")}
          />
          <TabButton
            title="รายละเอียด"
            isActive={activeTab === "description"}
            onPress={() => setActiveTab("description")}
          />
        </View>

        {/* ---(Tab Content)--- */}
        <View className="pt-4 px-4">
          {activeTab === "description" && (
            <Text className="text-text leading-7">
              {course.description || "ไม่มีรายละเอียด"}
            </Text>
          )}

          {/* ✨ ปรับแต่ง Tab ผลการเรียนรู้ */}
          {activeTab === "learning_outcome" && (
            <View>
              {!course.learning_outcome ? (
                <Text className="text-text leading-7">ไม่มีข้อมูล</Text>
              ) : (
                course.learning_outcome
                  .split("\n") // แยกเป็นแต่ละบรรทัดด้วยเว้นบรรทัด
                  .filter((line: string) => line.trim() !== "") // คัดกรองบรรทัดที่ว่างเปล่าออก
                  .map((line: string, index: number) => {
                    // เอาเครื่องหมาย - (Dash) ด้านหน้าข้อความออกเผื่อมีการใส่ไว้
                    const textWithoutDash = line.replace(/^-\s*/, "");
                    return (
                      <View key={index} className="flex-row mb-3 pr-4">
                        <Text className="text-text leading-7 font-bold mr-2">
                          {index + 1}.
                        </Text>
                        <Text className="text-text leading-7 flex-1">
                          {textWithoutDash}
                        </Text>
                      </View>
                    );
                  })
              )}
            </View>
          )}

          {activeTab === "chapter" && (
            <View>
              {/* ปรับ Layout ส่วนหัวข้อของบทเรียน ให้อยู่ซ้าย-ขวา */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-text/80 font-bold dark:text-disabletext text-small">
                  จำนวน {processedChapters.length} บท
                </Text>
                <Text className="text-text/80 font-bold dark:text-disabletext text-small">
                  ความยาวรวม {formattedTotalDuration}
                </Text>
              </View>

              {processedChapters.map((ch: any) => (
                <ChapterItem
                  key={ch.id}
                  chapter={ch}
                  courseImageUrl={course.cover_image_url}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ---(Bottom Action Bar: BULLETPROOF DOM)--- */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 bg-background shadow-custom justify-center"
        style={{ height: 90 }}
      >
        <View style={{ display: isEnrolled ? "flex" : "none", width: "100%" }}>
          <TouchableOpacity
            className="w-full bg-primary rounded-2xl py-4 items-center shadow-md shadow-primary/30"
            onPress={() =>
              router.push(`/course/lesson/${getNextChapterIdToLearn()}` as any)
            }
          >
            <Text className="text-white font-bold text-body">
              เรียนตอนถัดไป 🚀
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ display: !isEnrolled ? "flex" : "none", width: "100%" }}
          className="flex-row items-center justify-between"
        >
          <TouchableOpacity
            className="flex-1 bg-primary rounded-2xl py-4 flex-row items-center justify-center mr-3"
            onPress={() => {
              Alert.alert(
                "ยืนยันการซื้อ",
                `ซื้อคอร์สนี้ในราคา ${course.price_coins} เหรียญ?`,
                [
                  { text: "ยกเลิก", style: "cancel" },
                  { text: "ยืนยัน", onPress: () => enrollMutation.mutate() },
                ],
              );
            }}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-body mr-2">
                  ซื้อคอร์สเรียน
                </Text>
                <Image
                  source={AppIcons.COURSE.NORMAL.BUY}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mx-3">
            <Image
              source={AppIcons.HEADERS.NORMAL.COIN}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <Text className="text-secondary text-h6 font-bold ml-1 ">
              {course.price_coins}
            </Text>
          </View>

          <TouchableOpacity
            className="p-2  rounded-full"
            onPress={() => wishlistMutation.mutate()}
          >
            <Image
              source={
                isWishlisted
                  ? AppIcons.COURSE.NORMAL.WISHLIST.ACTIVE
                  : AppIcons.COURSE.NORMAL.WISHLIST.NORMAL[theme]
              }
              className="w-8 h-8"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* --- Sub Components --- */
const TabButton = ({ title, isActive, onPress }: any) => (
  <TouchableOpacity
    className={`flex-1 pb-3 items-center border-b-2 ${isActive ? "border-primary" : "border-transparent"}`}
    onPress={onPress}
  >
    <Text
      className={`font-bold ${isActive ? "text-primary" : "text-disabletext"}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const ChapterItem = ({ chapter, courseImageUrl }: any) => {
  const isLocked = chapter.state === "locked";
  const isCompleted = chapter.state === "completed";

  return (
    <TouchableOpacity
      disabled={isLocked}
      onPress={() => router.push(`/course/lesson/${chapter.id}` as any)}
      activeOpacity={0.7}
      className={`flex-row items-center p-3 rounded-2xl mb-3 border ${isLocked ? "bg-disablebg/40 dark:bg-disablebg/5 border-disablebg dark:border-disablebg/20" : isCompleted ? "bg-success/5 border-success/20" : "bg-primary/20 border-primary/40"}`}
    >
      <View className="w-[80px] h-[60px] bg-black rounded-lg overflow-hidden justify-center items-center mr-3 relative">
        <Image
          source={{ uri: courseImageUrl }}
          className="absolute inset-0 w-full h-full opacity-60"
          blurRadius={2}
        />
        {!isLocked && <Ionicons name="play" size={20} color="white" />}
      </View>

      <View className="flex-1">
        <Text
          className={`font-bold text-small ${isLocked ? "text-text/50 dark:text-disabletext/60" : "text-text"}`}
          numberOfLines={2}
        >
          {chapter.title}
        </Text>
        <Text className="text-text/50 dark:text-disabletext/80 font-regular text-tiny mt-1">
          ความยาว {Math.floor(chapter.duration_seconds / 60)}:
          {(chapter.duration_seconds % 60).toString().padStart(2, "0")} นาที
        </Text>
      </View>

      <View className="ml-2 w-8 h-8 items-center justify-center rounded-full bg-background/50">
        {isLocked ? (
          <Image
            source={AppIcons.COURSE.NORMAL.LOCK}
            className="w-6 h-6 opacity-50"
            resizeMode="contain"
          />
        ) : isCompleted ? (
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
        ) : (
          <Image
            source={AppIcons.COURSE.NORMAL.PLAY}
            className="w-6 h-6"
            resizeMode="contain"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
