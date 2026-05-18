import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import {
  getCategories,
  getWishlistCourses,
} from "@/src/services/course-service";
import { useNavigation, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const LOAD_ANIMATION = require("@/assets/json/loadingOtter.json");

const ProfileWishlistScreen = () => {
  const router = useRouter();
  const navigation = useNavigation(); // ✨ 1. เรียกใช้ navigation

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // ✨ 2. สร้าง state เก็บคำค้นหา

  // ✨ 3. เชื่อม Native Search Bar เข้ากับ State (ใช้ useLayoutEffect จะเนียนที่สุด)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "ค้นหาคอร์สที่อยากได้...",
        hideWhenScrolling: false,
        onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text), // ดักจับตอนพิมพ์
        onCancelButtonPress: () => setSearchQuery(""), // ดักจับตอนกดยกเลิก
      },
    });
  }, [navigation]);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ✨ 4. กรองข้อมูล (Filter) ตามคำค้นหาก่อนนำไปแสดงผล
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LottieView
          source={LOAD_ANIMATION}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">
          กำลังโหลดคอร์สที่อยากได้...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4">
      {/* ใส่ contentInsetAdjustmentBehavior เพื่อไม่ให้ Search bar บังเนื้อหาบน iOS */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {courses.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-disabletext font-regular text-body">
              ยังไม่มีคอร์สใน Wishlist
            </Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-disabletext font-regular text-body">
              ไม่พบคอร์ส "{searchQuery}"
            </Text>
          </View>
        ) : (
          <CourseHorizontalList
            courses={filteredCourses} // ✨ ส่งข้อมูลที่กรองแล้วเข้าไป
            onPressItem={(course) => router.push(`/course/${course.id}` as any)}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileWishlistScreen;
