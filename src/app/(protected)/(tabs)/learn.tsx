import CourseCardProgress from "@/src/components/CourseCardProgress";
import { AppIcons } from "@/src/constants/icons";
import { getMyCoursesData } from "@/src/services/course-service";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LOADING_ANIM = require("../../../../assets/json/loadingOtter.json");

const LearnScreen = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"continue" | "all">("continue");
  const [subFilter, setSubFilter] = useState<
    "recent" | "completed" | "prog_desc" | "prog_asc"
  >("recent");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const { data: myCourses = [], isLoading } = useQuery({
    queryKey: ["myCourses", user?.id],
    queryFn: () => getMyCoursesData(user?.id || null),
    enabled: !!user?.id,
  });

  useEffect(() => {
    setVisibleCount(10);
    setSubFilter("recent");
  }, [activeTab]);

  const filteredCourses = useMemo(() => {
    let result = [...myCourses];

    // --- กรองด้วยการค้นหา ---
    if (searchText.trim()) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // --- จัดเรียงตามแท็บที่เลือก ---
    if (activeTab === "continue") {
      result = result.filter((c) => !c.is_completed);

      if (subFilter === "prog_desc") {
        result.sort((a, b) => b.progress - a.progress);
      } else if (subFilter === "prog_asc") {
        result.sort((a, b) => a.progress - b.progress);
      } else {
        // ✨ ฟิลเตอร์ "เรียนล่าสุด": กรองเอาเฉพาะคอร์สที่ "เริ่มเรียนจริงๆ"
        result = result.filter((c) => c.last_accessed_at !== null);
        result.sort(
          (a, b) => (b.last_accessed_at ?? 0) - (a.last_accessed_at ?? 0),
        );
      }
    } else {
      if (subFilter === "completed") {
        result = result.filter((c) => c.is_completed);
      }
      result.sort(
        (a, b) =>
          new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime(),
      );
    }

    return result;
  }, [myCourses, searchText, activeTab, subFilter]);

  const displayedCourses = filteredCourses.slice(0, visibleCount);
  const hasMoreCourses = visibleCount < filteredCourses.length;

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
          กำลังเตรียมคอร์สของคุณ...
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
        {/* ---( แท็บหลัก )--- */}
        <View className="flex-row mt-6 px-4 border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity
            className={`flex-1 pb-3 items-center border-b-2 ${activeTab === "continue" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("continue")}
          >
            <Text
              className={`font-regular text-h6 ${activeTab === "continue" ? "text-primary" : "text-text"}`}
            >
              กำลังเรียน
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 pb-3 items-center border-b-2 ${activeTab === "all" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("all")}
          >
            <Text
              className={`font-regular text-h6 ${activeTab === "all" ? "text-primary" : "text-text"}`}
            >
              คอร์สทั้งหมด
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---( ฟิลเตอร์ย่อยสำหรับ "กำลังเรียน" )--- */}
        {activeTab === "continue" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 px-5 flex-row gap-3"
          >
            <FilterButton
              label="เรียนล่าสุด"
              isActive={subFilter === "recent"}
              onPress={() => setSubFilter("recent")}
            />
            <FilterButton
              label="คืบหน้ามากสุด"
              isActive={subFilter === "prog_desc"}
              onPress={() => setSubFilter("prog_desc")}
            />
            <FilterButton
              label="คืบหน้าน้อยสุด"
              isActive={subFilter === "prog_asc"}
              onPress={() => setSubFilter("prog_asc")}
            />
          </ScrollView>
        )}

        {/* ---( ฟิลเตอร์ย่อยสำหรับ "คอร์สทั้งหมด" )--- */}
        {activeTab === "all" && (
          <View className="flex-row items-center mt-4 gap-3 px-5">
            <FilterButton
              label="ซื้อล่าสุด"
              isActive={subFilter === "recent"}
              onPress={() => setSubFilter("recent")}
            />
            <FilterButton
              label="เรียนจบแล้ว"
              isActive={subFilter === "completed"}
              onPress={() => setSubFilter("completed")}
            />
          </View>
        )}

        {/* ---( ส่วนค้นหา )--- */}
        <View className="px-5 mt-4">
          {!isSearchMode && !searchText ? (
            <TouchableOpacity
              className="bg-background border border-primary/80 rounded-full py-2.5 flex-row items-center justify-center gap-2"
              onPress={() => setIsSearchMode(true)}
            >
              <Text className="text-primary font-regular text-body">
                ค้นหาคอร์สในคลัง
              </Text>
              <Image
                source={AppIcons.LEARN.NORMAL.SEARCH}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <View className="bg-background border border-primary/80 rounded-full px-6 py-1.5 flex-row items-center gap-2">
              <TextInput
                className="flex-1 text-text font-regular text-body py-1"
                placeholder="พิมพ์ชื่อคอร์ส..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              {searchText && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  className="px-2"
                >
                  <Text className="text-gray-400 font-bold text-body">✕</Text>
                </TouchableOpacity>
              )}
              <Image
                source={AppIcons.LEARN.NORMAL.SEARCH}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        <View className="px-6 mt-4 mb-2">
          <Text className="text-disabletext font-regular text-small">
            {searchText
              ? `พบ ${filteredCourses.length} คอร์ส`
              : `แสดง ${filteredCourses.length} คอร์ส`}
          </Text>
        </View>

        {/* ---( ส่วนแสดงรายการคอร์สและข้อความพิเศษ )--- */}
        <View className="items-center">
          {myCourses.length === 0 ? (
            /* ✨ กรณีที่ 1: ไม่มีคอร์สที่ซื้อเลยสักคอร์ส */
            <View className="mt-16 items-center px-10">
              <Text className="text-text font-regular text-body text-center">
                ซื้อคอร์สแล้วมาเรียนกันสิ! 🦦
              </Text>
            </View>
          ) : activeTab === "continue" &&
            subFilter === "recent" &&
            displayedCourses.length === 0 &&
            !searchText ? (
            /* ✨ กรณีที่ 2: เลือกฟิลเตอร์เรียนล่าสุด แต่ยังไม่เคยเริ่มเรียนตอนไหนเลย (จะแสดงคอร์สที่ซื้อล่าสุดให้แทน) */
            <View className="w-full items-center">
              <View className="mt-10 mb-5 items-center px-10">
                <Text className="text-text font-regular text-body text-center">
                  มาเริ่มเรียนคอร์สที่ซื้อกัน! 🚀
                </Text>
              </View>
              {/* ดึงคอร์สที่ซื้อล่าสุด (ที่ยังไม่จบ) มาโชว์ 5 คอร์สแรก */}
              {myCourses
                .filter((c) => !c.is_completed)
                .slice(0, 5)
                .map((course) => (
                  <CourseCardProgress
                    key={course.enrollment_id}
                    courseImage={{ uri: course.thumbnail }}
                    avatarImage={{ uri: course.instructorAvatar }}
                    courseName={course.title}
                    progress={Math.round(course.progress)}
                    onPress={() =>
                      router.push(
                        `/(protected)/course/${course.course_id}` as any,
                      )
                    }
                  />
                ))}
            </View>
          ) : (
            /* ✨ กรณีปกติ: แสดงผลตามฟิลเตอร์ */
            <>
              {displayedCourses.map((course) => (
                <CourseCardProgress
                  key={course.enrollment_id}
                  courseImage={{ uri: course.thumbnail }}
                  avatarImage={{ uri: course.instructorAvatar }}
                  courseName={course.title}
                  progress={Math.round(course.progress)}
                  onPress={() =>
                    router.push(
                      `/(protected)/course/${course.course_id}` as any,
                    )
                  }
                />
              ))}

              {displayedCourses.length === 0 && (
                <View className="mt-10 items-center">
                  <Text className="text-disabletext font-regular text-h6">
                    ไม่พบคอร์สเรียนที่ตรงกัน 🦦
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {hasMoreCourses && (
          <TouchableOpacity
            className="mx-5 mt-6 mb-4 bg-primary/5 border border-primary/20 rounded-[15px] py-3 items-center"
            onPress={() => setVisibleCount((v) => v + 10)}
          >
            <Text className="text-primary font-bold text-body">
              แสดงคอร์สเพิ่มเติม
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const FilterButton = ({
  label,
  isActive,
  onPress,
  variant = "primary",
}: any) => {
  const activeStyles =
    variant === "success"
      ? "bg-success/10 border-success/50"
      : "bg-primary/10 border-primary/50";

  const activeText = variant === "success" ? "text-success" : "text-primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-1.5 rounded-full border mr-2 ${isActive ? activeStyles : "bg-transparent border-gray-300 dark:border-gray-700"}`}
    >
      <Text
        className={`text-small font-bold ${isActive ? activeText : "text-disabletext"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default LearnScreen;
