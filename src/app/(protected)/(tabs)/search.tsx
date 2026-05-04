import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import { AppIcons } from "@/src/constants/icons";
import { getCategories, getPublishedCourses } from "@/src/services/course-service";
import { Categories } from "@/src/types/categories";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SearchScreen = () => {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
            categories: categoryList.length > 0 ? categoryList : ["ไม่มีหมวดหมู่"],
            thumbnail: course.cover_image_url
              ? { uri: course.cover_image_url }
              : AppIcons.SEARCH.NORMAL.SEARCH_RESULT,
            price_coin: course.price_coins ?? 0,
          };
        });

        setCourses(mappedCourses);
      } catch (error) {
        console.error("fetchData error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchResults = useMemo(() => {
    if (!q || q.trim() === "") return [];

    return courses.filter((course) =>
      `${course.title} ${course.categories.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }, [q, courses]);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const visibleCourses = courses.slice(0, visibleCount);
  const hasMoreCourses = visibleCount < courses.length;

  if (q && q.trim() !== "") {
    return (
      <View className="flex-1 bg-background px-4 pt-2">
        <View className="items-center flex-row mt-2">
          <Text className="text-text font-regular text-h6 mb-3">
            ผลลัพธ์การค้นหา
          </Text>
          <Image
            source={AppIcons.SEARCH.NORMAL.SEARCH_RESULT}
            className="w-7 h-7 ml-2 -top-1"
            resizeMode="contain"
          />
        </View>

        {searchResults.length === 0 ? (
          <View className="items-center mt-20">
            <Text className="text-disabletext text-body font-regular">
              ไม่พบผลลัพธ์ที่ตรงกับ “{q}”
            </Text>
          </View>
        ) : (
          <CourseHorizontalList courses={searchResults} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row mt-2 items-center mb-1 px-4">
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
            gap: 5,
            marginTop: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {[
            ...new Set(courses.flatMap((course) => course.categories)),
          ].map((category, index) => (
            <View key={`${category}-${index}`}>
              <Text className="self-start text-white font-regular text-tiny rounded-[10px] bg-primary px-2 py-1">
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row px-4 mt-2 items-center">
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
          <CourseHorizontalList courses={visibleCourses} 
          onPressItem={(course) => router.push(`/course/${course.id}` as any)} />

          {hasMoreCourses && (
            <TouchableOpacity onPress={() => setVisibleCount((prev) => prev + 6)}>
              <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                <Text className="text-primary font-regular text-body">
                  ค้นหาคอร์สเพิ่มเติม
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