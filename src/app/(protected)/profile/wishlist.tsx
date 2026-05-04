import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import { getCategories, getWishlistCourses } from "@/src/services/course-service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

const ProfileWishlistScreen = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wishlistCourses, allCategories] = await Promise.all([
          getWishlistCourses(),
          getCategories(),
        ]);

        const getCategoryName = (id?: number | null) => {
          if (!id) return null;
          return allCategories.find((c) => c.id === id)?.name || null;
        };

        const mapped: CourseItem[] = wishlistCourses.map((course) => {
          const names = [
            getCategoryName(course.category_id),
            getCategoryName(course.sub_category_1_id),
            getCategoryName(course.sub_category_2_id),
          ].filter((name): name is string => Boolean(name));

          return {
            id: course.id,
            title: course.title,
            categories: [...new Set(names)],
            thumbnail: {
              uri: course.cover_image_url || "https://via.placeholder.com/300",
            },
            price_coin: course.price_coins,
          };
        });

        setCourses(mapped);
      } catch (error) {
        console.error("load wishlist screen error:", error);
      }
    };

    loadData();
  }, []);

  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CourseHorizontalList
          courses={courses}
          onPressItem={(course) => router.push(`/course/${course.id}` as any)}
        />
      </ScrollView>
    </View>
  );
};

export default ProfileWishlistScreen;