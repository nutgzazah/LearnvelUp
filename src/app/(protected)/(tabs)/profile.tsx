import CardLearnPath from "@/src/components/CardLearnPath";
import CourseCard from "@/src/components/CourseCard";
import { AppIcons } from "@/src/constants/icons";
import { supabase } from "@/src/lib/supabase";
import { fetchAchievements } from "@/src/services/archieveService";
import {
  getCourseChapterProgressSummary,
  getEnrolledCourseOptions,
  getWishlistCourses,
} from "@/src/services/course-service";
import { getUserEnrolledLearningPaths } from "@/src/services/learnpathService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const LOAD_ANIMATION = require("@/assets/json/loadingOtter.json");
const defaultAvatar = require("@/assets/avatar/generalOtter.png");

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  //  Refetch ข้อมูลเมื่อหน้าจอได้รับ Focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["userProfileMain"] });
        queryClient.invalidateQueries({ queryKey: ["enrolledCourseOptions"] });
        queryClient.invalidateQueries({ queryKey: ["chapterProgress"] });
        queryClient.invalidateQueries({ queryKey: ["equippedAchievements"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      }
    }, [user?.id, queryClient]),
  );

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfileMain", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user");

      const [{ data: profile }, { data: stats }] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, equipped_avatar_id, equipped_frame_id")
          .eq("id", user.id)
          .single(),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      ]);

      let avatarUrl = null;
      let bgUrl = null;

      if (profile?.equipped_avatar_id) {
        const { data } = await supabase
          .from("items")
          .select("image_url")
          .eq("id", profile.equipped_avatar_id)
          .single();
        avatarUrl = data?.image_url;
      }
      if (profile?.equipped_frame_id) {
        const { data } = await supabase
          .from("items")
          .select("image_url")
          .eq("id", profile.equipped_frame_id)
          .single();
        bgUrl = data?.image_url;
      }

      const currentLevel = stats?.level || 1;
      const { data: reqs } = await supabase
        .from("level_requirements")
        .select("level, min_total_xp")
        .in("level", [currentLevel, currentLevel + 1]);

      const currentReq =
        reqs?.find((r) => r.level === currentLevel)?.min_total_xp || 0;
      const nextReq =
        reqs?.find((r) => r.level === currentLevel + 1)?.min_total_xp ||
        currentReq + 1000;

      return {
        username: profile?.username || "Guest User",
        avatarUrl,
        bgUrl,
        level: currentLevel,
        xp: stats?.xp || 0,
        streak: stats?.current_streak || 0,
        total_courses: stats?.total_courses_completed || 0,
        total_quizzes: stats?.total_quizzes_passed || 0,
        currentReqXp: currentReq,
        nextReqXp: nextReq,
      };
    },
    enabled: !!user?.id,
  });

  const { data: enrolledCourses } = useQuery({
    queryKey: ["enrolledCourseOptions", user?.id],
    queryFn: () => getEnrolledCourseOptions(user!.id),
    enabled: !!user?.id,
  });

  const validCourses = (enrolledCourses || []).filter((c) => c.id !== "all");

  useEffect(() => {
    if (validCourses.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(validCourses[0].id as number);
    }
  }, [enrolledCourses]);

  const { data: chapterProgress } = useQuery({
    queryKey: ["chapterProgress", user?.id, selectedCourseId],
    queryFn: () =>
      getCourseChapterProgressSummary(user!.id, selectedCourseId as number),
    enabled: !!user?.id && selectedCourseId !== null,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: () => getWishlistCourses(),
    enabled: !!user?.id,
  });

  const { data: achievements } = useQuery({
    queryKey: ["equippedAchievements", user?.id],
    queryFn: async () => {
      const all = await fetchAchievements(user!.id);
      return all.filter((a: any) => a.is_equipped);
    },
    enabled: !!user?.id,
  });

  const { data: learningPaths } = useQuery({
    queryKey: ["enrolledLearningPaths", user?.id],
    queryFn: () => getUserEnrolledLearningPaths(user!.id),
    enabled: !!user?.id,
  });

  const filteredCourseOptions = validCourses.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) setShowDropdown(false);
      },
    }),
  ).current;

  if (isProfileLoading || !profileData) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LottieView
          source={LOAD_ANIMATION}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">
          กำลังเตรียมข้อมูลโปรไฟล์...
        </Text>
      </View>
    );
  }

  // คำนวณ % เลเวล
  const xpInCurrentLevel = Math.max(
    0,
    profileData.xp - profileData.currentReqXp,
  );
  const xpNeededForNext = Math.max(
    1,
    profileData.nextReqXp - profileData.currentReqXp,
  );
  const progressPercentXP = Math.min(xpInCurrentLevel / xpNeededForNext, 1);
  const levelRadius = 55,
    levelStroke = 8;
  const levelCircum = 2 * Math.PI * levelRadius;
  const levelOffset = levelCircum - progressPercentXP * levelCircum;

  // คำนวณข้อมูลคอร์สที่เลือก
  const selectedCourseData = validCourses.find(
    (c) => c.id === selectedCourseId,
  );
  const completedChaps = chapterProgress?.completed_chapters ?? 0;
  const totalChaps = chapterProgress?.total_chapters ?? 0;
  const courseProgressPercent =
    totalChaps > 0 ? (completedChaps / totalChaps) * 100 : 0;

  // คำนวณภาพรวม (Overall)
  const totalEnrolled = validCourses.length;
  const completedCourses = profileData.total_courses || 0;
  const overallPercent =
    totalEnrolled > 0 ? (completedCourses / totalEnrolled) * 100 : 0;
  const overallRadius = 32,
    overallStroke = 7; //
  const overallCircum = 2 * Math.PI * overallRadius;
  const overallOffset = overallCircum - (overallPercent / 100) * overallCircum;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Preview & User Info */}
        <View className="mb-6">
          {/* พื้นหลัง Cover */}
          <View className="h-48 w-full bg-card overflow-hidden">
            {profileData.bgUrl ? (
              <Image
                source={{ uri: profileData.bgUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary/20" />
            )}
          </View>

          {/* ข้อมูลโปรไฟล์แบบใหม่ จัดให้อยู่แนวนอนชิดซ้ายตามเรฟ */}
          <View className="px-5 -mt-10 flex-row items-end">
            {/* รูป Avatar น้องนาก */}
            <View className="w-[104px] h-[104px] rounded-full border-[4px] border-background bg-background overflow-hidden items-center justify-center">
              <Image
                source={
                  profileData.avatarUrl
                    ? { uri: profileData.avatarUrl }
                    : defaultAvatar
                }
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            {/* ข้อมูลด้านขวา (ชื่อ, Streak, หลอด Level) */}
            <View className="flex-1 ml-4 pb-1">
              <View className="flex-row items-center mb-1">
                <Text
                  className="text-[22px] font-bold text-text"
                  numberOfLines={1}
                >
                  {profileData.username}
                </Text>
                <View className="flex-row items-center bg-alert px-2.5 py-0.5 rounded-full ml-3 gap-1">
                  <Image
                    source={AppIcons.HEADERS.NORMAL.STREAKWHITE}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                  <Text className="text-white text-small font-bold pt-0.5">
                    {profileData.streak}
                  </Text>
                </View>
              </View>

              {/* หลอด Progress Level และ ป้ายหมวก */}
              <View className="flex-row items-center w-full mt-1 pr-4">
                <View className="bg-alert px-2.5 py-0.5 rounded-full flex-row items-center z-10 border-[2px] border-background">
                  <Image
                    source={AppIcons.HEADERS.NORMAL.XPWHITE}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                  <Text className="text-white text-small font-black ml-1 pt-0.5">
                    {profileData.level}
                  </Text>
                </View>
                <View className="flex-1 h-3 border border-alert rounded-r-full -ml-3 overflow-hidden bg-background">
                  <View
                    className="h-full bg-alert rounded-r-full border border-background"
                    style={{ width: `${progressPercentXP * 100}%` }}
                  />
                </View>
              </View>

              {/* ข้อความ XP */}
              <Text className="text-[12px] font-bold mt-1.5 ml-1 text-alert">
                XP : {xpInCurrentLevel}/{xpNeededForNext}
              </Text>
            </View>
          </View>
        </View>
        {/* Stats Boxes */}
        <View className="flex-row gap-4 px-4 mb-8">
          <View className="flex-1 bg-card border border-primary/20 rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-h2 font-black text-primary">
              {profileData.total_courses}
            </Text>
            <Text className="text-small text-text mt-1 font-bold">
              คอร์สที่เรียนจบทั้งหมด
            </Text>
          </View>
          <View className="flex-1 bg-card border border-secondary/20 rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-h2 font-black text-secondary">
              {profileData.total_quizzes}
            </Text>
            <Text className="text-small text-text mt-1 font-bold">
              บทเรียนที่ผ่านทั้งหมด
            </Text>
          </View>
        </View>

        {/* ความคืบหน้าของบทเรียน Section */}
        <View className="px-4 mb-8">
          <View className="flex-row items-center gap-2 mb-4 ml-2">
            <Image
              source={AppIcons.PROFILE.NORMAL.PROGRESS}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <Text className="text-h6 font-bold text-text">
              ความคืบหน้าของบทเรียน
            </Text>
          </View>

          {/* 🔘 1. ภาพรวมการเรียนจบ (ใหญ่ขึ้น) */}
          <View className="flex-row items-center bg-background border border-primary/20 rounded-3xl p-5 shadow-sm mb-4">
            <View className="relative items-center justify-center w-[75px] h-[75px]">
              <Svg
                width={75}
                height={75}
                viewBox="0 0 75 75"
                className="absolute"
              >
                <Circle
                  cx="37.5"
                  cy="37.5"
                  r={overallRadius}
                  stroke="#787e8f"
                  strokeWidth={overallStroke}
                  fill="none"
                />
                <Circle
                  cx="37.5"
                  cy="37.5"
                  r={overallRadius}
                  stroke="#6C5CE7"
                  strokeWidth={overallStroke}
                  fill="none"
                  strokeDasharray={overallCircum}
                  strokeDashoffset={overallOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="37.5, 37.5"
                />
              </Svg>
              <Text className="absolute font-black text-body text-primary">
                {Math.round(overallPercent)}%
              </Text>
            </View>
            <View className="flex-1 ml-5 justify-center">
              {totalEnrolled === 0 ? (
                <Text className="text-text font-bold text-small">
                  ลงทะเบียนคอร์สแรกเพื่อเริ่มเรียน!
                </Text>
              ) : (
                <>
                  <Text className="text-text font-black text-h6">
                    {completedCourses === totalEnrolled
                      ? "🎉 จบครบทุกคอร์สแล้ว!"
                      : "กำลังลุยคอร์สเรียน"}
                  </Text>
                  <Text className="text-text font-bold text-small mt-2">
                    จบไปแล้ว {completedCourses} / {totalEnrolled} คอร์ส
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* 🔘 2. การ์ดคอร์สที่เลือก (พร้อม Progress Bar สี Primary) */}
          {validCourses.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowDropdown(true)}
              className="bg-card border border-primary/20 rounded-3xl p-4 shadow-sm"
            >
              <View className="flex-row items-center mb-4">
                <Image
                  source={{
                    uri:
                      selectedCourseData?.cover_image_url ||
                      "https://via.placeholder.com/150",
                  }}
                  className="w-[100px] h-[65px] rounded-xl bg-disablebg/20"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-4 pr-1">
                  <Text
                    className="font-bold text-small text-text mb-2"
                    numberOfLines={2}
                  >
                    {selectedCourseData?.title}
                  </Text>
                  <View className="bg-primary px-3 py-0.5 rounded-full self-start">
                    <Text className="text-white font-regular text-tiny">
                      ทำไปแล้ว {completedChaps} / {totalChaps} บทเรียน
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6C5CE7" />
              </View>

              {/*  Progress Bar (คล้ายรูปตัวอย่าง) */}
              <View className="flex-row items-center gap-3">
                <View className="flex-1 h-2.5 bg-disablebg/20 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${courseProgressPercent}%` }}
                  />
                </View>
                <Text className="text-primary font-black text-tiny w-12 text-right">
                  {Math.round(courseProgressPercent)}%
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* เหรียญตราความสำเร็จ */}
        <View className="mb-6">
          <SectionButton
            title="เหรียญตราความสำเร็จ"
            onPress={() => router.push("/profile/achieve")}
          />
          {!achievements || achievements.length === 0 ? (
            <View className="px-4 py-6 items-center">
              <Text className="text-disabletext font-regular text-small">
                ยังไม่ได้สวมใส่เหรียญตรา
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 16 }}
              showsHorizontalScrollIndicator={false}
            >
              {achievements.map((achieve: any) => (
                <View key={achieve.id} className="items-center mr-4 w-[90px]">
                  <Image
                    source={
                      achieve.image
                        ? achieve.image
                        : { uri: "https://via.placeholder.com/100" }
                    }
                    className="w-[90px] h-[90px] mb-2 rounded-full border-2 border-primary"
                    resizeMode="contain"
                  />
                  <Text
                    className="text-text text-tiny font-bold text-center"
                    numberOfLines={2}
                  >
                    {achieve.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* คอร์สที่อยากได้ */}
        <View className="mb-6">
          <SectionButton
            title="คอร์สที่อยากได้"
            onPress={() => router.push("/profile/wishlist")}
          />
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 8 }}
            showsHorizontalScrollIndicator={false}
          >
            {!wishlist || wishlist.length === 0 ? (
              <View className="px-4 py-6 items-center w-screen">
                <Text className="text-disabletext font-regular text-small">
                  ยังไม่มีคอร์สใน Wishlist
                </Text>
              </View>
            ) : (
              wishlist.slice(0, 5).map((course: any) => (
                <CourseCard
                  key={course.id}
                  courseImage={{
                    uri:
                      course.cover_image_url ||
                      "https://via.placeholder.com/300",
                  }}
                  avatarImage={{
                    uri:
                      course.instructors?.avatar_url ||
                      "https://via.placeholder.com/100",
                  }}
                  courseName={course.title}
                  coins={course.price_coins}
                  onPress={() => router.push(`/course/${course.id}` as any)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* เส้นทางการเรียน */}
        <View className="mb-10">
          <SectionButton
            title="เส้นทางการเรียนของคุณ"
            onPress={() => router.push("/learnpath" as any)}
          />
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 8 }}
            showsHorizontalScrollIndicator={false}
          >
            {!learningPaths || learningPaths.length === 0 ? (
              <View className="px-4 py-6 items-center w-screen">
                <Text className="text-disabletext font-regular text-small">
                  ยังไม่ได้ลงทะเบียนเส้นทางการเรียน
                </Text>
              </View>
            ) : (
              learningPaths.map((item: any) => (
                <CardLearnPath
                  key={item.id}
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
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/*  Modal เลือกคอร์ส */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
          <View className="bg-background rounded-t-3xl h-[72%] pb-8 border-t border-disablebg/30">
            <View
              {...panResponder.panHandlers}
              className="w-full bg-transparent"
            >
              <View className="mt-2 mb-2" />
              <View className="px-6 py-3 border-b border-disablebg/50 flex-row justify-between items-center">
                <Text className="text-h5 font-bold text-text">เลือกคอร์ส</Text>
                <TouchableOpacity
                  onPress={() => setShowDropdown(false)}
                  className="bg-disablebg/30 p-1.5 rounded-full"
                >
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="px-6 py-4">
              <TextInput
                placeholder="ค้นหาชื่อคอร์ส..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-card rounded-xl px-4 py-3 text-text font-regular text-body border border-primary/20"
              />
            </View>
            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
              {filteredCourseOptions.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  onPress={() => {
                    setSelectedCourseId(item.id as number);
                    setShowDropdown(false);
                  }}
                  className={`mb-3 p-3 rounded-2xl flex-row items-center border ${selectedCourseId === item.id ? "bg-primary/5 border-primary" : "bg-card border-disablebg/30"}`}
                >
                  <Image
                    source={{
                      uri:
                        (item as any).cover_image_url ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-[88px] h-[58px] rounded-xl bg-disablebg/20"
                    resizeMode="cover"
                  />
                  <Text
                    className={`ml-3 font-regular text-small flex-1 ${selectedCourseId === item.id ? "text-primary font-bold" : "text-text"}`}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {selectedCourseId === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#6C5CE7"
                    />
                  )}
                </TouchableOpacity>
              ))}
              {filteredCourseOptions.length === 0 && (
                <View className="py-10 items-center">
                  <Text className="text-disabletext font-regular">
                    ไม่พบคอร์สที่ค้นหา
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-card mx-4 mb-3 px-5 py-3.5 rounded-2xl border border-primary/20 shadow-sm"
    >
      <Text className="text-h6 font-bold text-text">{title}</Text>
      <View className="bg-background rounded-full p-1 border border-disablebg/30">
        <Ionicons name="chevron-forward" size={20} color="#6C5CE7" />
      </View>
    </TouchableOpacity>
  );
}
