import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import { AppIcons } from "@/src/constants/icons";
import {
  getCategories,
  getPublishedCourses,
} from "@/src/services/course-service";
import { Categories } from "@/src/types/categories";
import { Ionicons } from "@expo/vector-icons";
import { useScrollToTop } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const LOADING_ANIM = require("../../../../assets/json/loadingOtter.json");

const SearchScreen = () => {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [q]);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["searchCoursesData"],
    queryFn: async () => {
      const [courseData, categoryData] = await Promise.all([
        getPublishedCourses(),
        getCategories(),
      ]);

      const mappedCourses: CourseItem[] = courseData.map((course: any) => {
        const mainCategory = categoryData.find(
          (cat: Categories) => cat.id === course.category_id,
        );

        const subCategory1 = categoryData.find(
          (cat: Categories) => cat.id === course.sub_category_1_id,
        );

        const categoryList = [mainCategory?.name, subCategory1?.name].filter(
          (value): value is string => Boolean(value),
        );

        return {
          id: course.id,
          title: course.title ?? "",
          categories:
            categoryList.length > 0 ? categoryList : ["ไม่มีหมวดหมู่"],
          thumbnail: course.cover_image_url
            ? { uri: course.cover_image_url }
            : AppIcons.SEARCH.NORMAL.SEARCH_RESULT,
          price_coin: course.price_coins ?? 0,
        };
      });

      return mappedCourses;
    },
  });

  const searchResults = useMemo(() => {
    if (!q || q.trim() === "") return [];

    return courses.filter((course) =>
      `${course.title} ${course.categories.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }, [q, courses]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LottieView
          source={LOADING_ANIM}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">กำลังค้นหาข้อมูล...</Text>
      </View>
    );
  }

  const displayData = q && q.trim() !== "" ? searchResults : courses;
  const visibleCourses = displayData.slice(0, visibleCount);
  const hasMoreCourses = visibleCount < displayData.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const goToCourseDetail = (course: CourseItem) => {
    router.push(`/(protected)/course/${course.id}` as any);
  };

  // --- กรณีที่ 1: กำลังค้นหาคอร์ส (มี q) ---
  if (q && q.trim() !== "") {
    return (
      <View className="flex-1 bg-background px-4 pt-2">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center mt-6 mb-3 flex-wrap">
            <Text className="text-text font-regular text-h6 mr-2">
              ผลลัพธ์การค้นหา:
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/search")} // กดลบเพื่อกลับไปหน้า Search เปล่าๆ
              className="flex-row items-center  border border-primary px-3 py-1.5 rounded-full"
            >
              <Text className="text-primary font-bold text-small mr-1">
                {q}
              </Text>
              <Ionicons name="close-circle" size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {searchResults.length === 0 ? (
            <View className="items-center mt-20">
              <Text className="text-disabletext text-body font-regular">
                ไม่พบผลลัพธ์ที่ตรงกับ “{q}”
              </Text>
            </View>
          ) : (
            <View>
              <CourseHorizontalList
                courses={visibleCourses}
                onPressItem={goToCourseDetail}
              />

              {hasMoreCourses && (
                <TouchableOpacity onPress={loadMore}>
                  <View className="mt-4 mb-8 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                    <Text className="text-primary font-bold text-body">
                      โหลดคอร์สเพิ่มเติม...
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // --- กรณีที่ 2: หน้า Default (ยังไม่ได้ค้นหา) ---
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row mt-6 items-center mb-1 px-4">
          <Text className="text-text font-regular text-h6">
            หมวดหมู่ยอดนิยม
          </Text>
          <Image
            source={AppIcons.SEARCH.NORMAL.HOT_CATEGORY}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingBottom: 20,
            paddingHorizontal: 10,
            gap: 10,
            marginTop: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {[...new Set(courses.flatMap((course) => course.categories))].map(
            (category, index) => (
              <TouchableOpacity
                key={`${category}-${index}`}
                onPress={() =>
                  router.replace({
                    pathname: "/search",
                    params: { q: category },
                  })
                }
              >
                <Text className="self-start text-white font-regular text-small rounded-[8px] bg-primary px-3.5 py-1.5">
                  {category}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        <View className="flex-row px-4  items-center">
          <Text className="text-text font-regular text-h6 mb-2">
            คุณอาจสนใจ
          </Text>
          <Image
            source={AppIcons.SEARCH.NORMAL.INTEREST}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        </View>

        <View className="px-4">
          <CourseHorizontalList
            courses={visibleCourses}
            onPressItem={goToCourseDetail}
          />

          {hasMoreCourses && (
            <TouchableOpacity onPress={loadMore}>
              <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                <Text className="text-primary font-bold text-body">
                  โหลดคอร์สเพิ่มเติม...
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
