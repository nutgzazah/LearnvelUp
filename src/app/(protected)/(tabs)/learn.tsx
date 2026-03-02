import CourseCardProgress from "@/src/components/CourseCardProgress";
import { AppIcons } from "@/src/constants/icons";
import { MockCourse, mockCourseData } from "@/src/constants/mockCourseData";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LearnScreen = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // จัดเรียงและกรองคอร์ส
  const filteredCourses = useMemo(() => {
    let courses: MockCourse[] = [...mockCourseData];

    // กรองตามการค้นหา
    if (searchText.trim()) {
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchText.toLowerCase()) ||
          course.description.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // จัดเรียงตาม tab ที่เลือก
    if (activeTab === "recent") {
      // เรียนล่าสุด- เรียงตาม updated_at
      courses.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    } else {
      // คอร์สทั้งหมด- เรียงตาม created_at
      courses.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return courses;
  }, [searchText, activeTab]);

  // จำกัดจำนวนที่แสดงผล (5 คอร์สแรก หรือทั้งหมดถ้ากดแสดงเพิ่ม)
  const displayedCourses = showAll
    ? filteredCourses
    : filteredCourses.slice(0, 5);
  const hasMoreCourses = filteredCourses.length > 5;

  // Reset showAll เมื่อเปลี่ยน tab หรือ search
  const handleTabChange = (tab: "recent" | "all") => {
    setActiveTab(tab);
    setShowAll(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setShowAll(false);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---( Tab Section )--- */}
        <View className="flex-row mt-4 px-4 items-center gap-6 justify-center">
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "recent" ? "border-primary" : "border-transparent"}`}
            onPress={() => handleTabChange("recent")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "recent" ? "text-primary" : "text-text"}`}
            >
              เรียนล่าสุด
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "all" ? "border-primary" : "border-transparent"}`}
            onPress={() => handleTabChange("all")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "all" ? "text-primary" : "text-text"}`}
            >
              คอร์สทั้งหมด
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---( Search & Filter Section )--- */}
        <View className="flex-row items-center justify-center px-4 mt-4">
          {!isSearchMode ? (
            <TouchableOpacity
              className="mx-2 rounded-[15px] items-center justify-center"
              onPress={() => setIsSearchMode(true)}
            >
              <View className="border border-primary rounded-[15px] px-32 py-1 flex-row items-center gap-2 w-full">
                <Text className="text-primary font-regular text-body">
                  ค้นหา
                </Text>
                <Image
                  source={AppIcons.LEARN.NORMAL.SEARCH}
                  className="w-7 h-7"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View className="flex-1 mx-2">
              <View className="border border-primary rounded-[15px] px-4 py-1 flex-row items-center gap-2">
                <TextInput
                  className="flex-1 text-text font-regular text-body"
                  placeholder="ค้นหาคอร์ส..."
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={handleSearchChange}
                  autoFocus
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => handleSearchChange("")}>
                    <Text className="text-primary font-regular text-body">
                      ✕
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <Image
                  source={AppIcons.LEARN.NORMAL.SEARCH}
                  className="w-7 h-7"
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
          <TouchableOpacity className="items-center justify-center">
            <View className=" rounded-[15px] px-4 py-1 flex-row items-center">
              <Image
                source={
                  isDarkMode
                    ? AppIcons.LEARN.NORMAL.FILTER_ADD.DARK
                    : AppIcons.LEARN.NORMAL.FILTER_ADD.LIGHT
                }
                className="w-7 h-7"
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* ---( Course Count Info )--- */}
        <View className="px-4 mt-4">
          <Text className="text-text font-regular text-small">
            {searchText
              ? `พบ ${filteredCourses.length} คอร์ส`
              : `${activeTab === "recent" ? "เรียนล่าสุด" : "คอร์สทั้งหมด"}: ${filteredCourses.length} คอร์ส`}
          </Text>
        </View>

        {/* ---( Course List Section )--- */}
        <View className="items-center">
          {displayedCourses.length > 0 ? (
            displayedCourses.map((course) => (
              <CourseCardProgress
                key={course.id}
                courseImage={course.thumbnail}
                avatarImage={course.teacherAvatar}
                courseName={course.title}
                progress={course.progress}
                onPress={() => console.log("Course ID:", course.id)}
              />
            ))
          ) : (
            <View className="mt-8 items-center">
              <Text className="text-text font-regular text-body">
                ไม่พบคอร์สที่ค้นหา
              </Text>
            </View>
          )}
        </View>

        {/* ---( Show More Button )--- */}
        {!showAll && hasMoreCourses && displayedCourses.length > 0 && (
          <View className="px-4">
            <TouchableOpacity onPress={() => setShowAll(true)}>
              <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                <Text className="text-primary font-regular text-body">
                  แสดงคอร์สเพิ่มเติม ({filteredCourses.length - 5} คอร์ส)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ---( Show Less Button )--- */}
        {showAll && hasMoreCourses && (
          <View className="px-4">
            <TouchableOpacity onPress={() => setShowAll(false)}>
              <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                <Text className="text-primary font-regular text-body">
                  แสดงน้อยลง
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LearnScreen;
