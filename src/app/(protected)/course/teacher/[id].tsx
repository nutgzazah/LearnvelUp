import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import { AppIcons } from "@/src/constants/icons";
import {
  getCategories, // ✨ เพิ่มการดึงหมวดหมู่
  getInstructorById,
  getPublishedCoursesByInstructorId,
} from "@/src/services/course-service";
import { Categories } from "@/src/types/categories"; // ✨ นำเข้า Type Categories
import { Course } from "@/src/types/course";
import { Instructor } from "@/src/types/instructor";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

const TeacherProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [teacher, setTeacher] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Categories[]>([]); // ✨ State สำหรับเก็บหมวดหมู่
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!id) return;

        const teacherId = Number(id);
        if (Number.isNaN(teacherId)) return;

        // ✨ ดึงข้อมูลหมวดหมู่มาพร้อมกันเลยเพื่อเอาไปแมปใส่คอร์ส
        const [teacherData, teacherCourses, categoryData] = await Promise.all([
          getInstructorById(teacherId),
          getPublishedCoursesByInstructorId(teacherId),
          getCategories(),
        ]);

        setTeacher(teacherData);
        setCourses(teacherCourses);
        setCategories(categoryData);
      } catch (error) {
        console.error("fetchTeacherData error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  // ✨ จัดการแมปหมวดหมู่ใส่คอร์ส เพื่อให้ CourseHorizontalList นำไปโชว์ได้
  const courseItems = useMemo<CourseItem[]>(() => {
    return courses.map((course) => {
      const mainCategory = categories.find(
        (cat) => cat.id === course.category_id,
      );
      const subCategory = categories.find(
        (cat) => cat.id === course.sub_category_1_id,
      );

      const categoryList = [mainCategory?.name, subCategory?.name].filter(
        (val): val is string => Boolean(val),
      );

      return {
        id: course.id,
        title: course.title,
        categories: categoryList.length > 0 ? categoryList : ["ไม่มีหมวดหมู่"],
        thumbnail: {
          uri: course.cover_image_url || "https://via.placeholder.com/300",
        },
        price_coin: course.price_coins ?? 0,
      };
    });
  }, [courses, categories]);

  // คำนวณผู้เรียนทั้งหมด
  const totalLearners = useMemo(() => {
    return courses.reduce(
      (sum, course) => sum + (course.total_enrolled ?? 0),
      0,
    );
  }, [courses]);

  // คัดคอร์สยอดนิยม
  const popularCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => (b.total_enrolled ?? 0) - (a.total_enrolled ?? 0))
      .slice(0, 5);
  }, [courses]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-text font-regular text-body">
          ไม่พบข้อมูลผู้สอน
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
      >
        <View className="px-5 mt-4 gap-4">
          {/* ---(Header: Avatar & Name)--- */}
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: teacher.avatar_url || "https://via.placeholder.com/100",
              }}
              // ✨ เอา border ที่แข็งๆ ออก ให้ดูคลีนขึ้น
              className="w-24 h-24 rounded-full bg-gray-200"
            />
            <View className="flex-1">
              <Text
                className="text-text font-bold text-h5 mb-1"
                numberOfLines={2}
              >
                {teacher.username || "-"}
              </Text>
              <Text className="text-primary font-bold text-body">ผู้สอน</Text>
            </View>
          </View>

          {/* ---(Stats Row: Learners & Total Courses)--- */}
          {/* ✨ ปรับเลย์เอาต์ส่วนสถิติให้ดูน่าเชื่อถือและสวยงามขึ้น */}
          <View className="flex-row items-center mt-2 gap-6">
            <View className="flex-row items-center gap-2">
              <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                <Image
                  source={AppIcons.COURSE.NORMAL.LEARNERS}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text className="text-text font-bold text-body">
                  {totalLearners}
                </Text>
                <Text className="text-disabletext font-regular text-tiny">
                  ผู้เรียนทั้งหมด
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                <Image
                  source={AppIcons.COURSE.NORMAL.PLAY}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text className="text-text font-bold text-body">
                  {courses.length}
                </Text>
                <Text className="text-disabletext font-regular text-tiny">
                  คอร์สทั้งหมด
                </Text>
              </View>
            </View>
          </View>

          {/* ---(Teacher Bio)--- */}
          {/* ✨ เปลี่ยนจากกรอบสีม่วง เป็นพื้นหลังซอฟต์ๆ (bg-primary/5) ให้ดูพรีเมียมขึ้น */}
          <View className="bg-primary/5 px-4 py-4 rounded-[10px] mt-2">
            <Text className="text-primary font-bold text-body mb-2">
              เกี่ยวกับผู้สอน
            </Text>
            <Text className="text-text font-regular text-small leading-relaxed">
              {teacher.bio?.trim() ||
                "ยังไม่มีข้อมูลอธิบายเพิ่มเติมเกี่ยวกับผู้สอนท่านนี้"}
            </Text>
          </View>
        </View>

        {/* ---(Popular Course Section)--- */}
        {popularCourses.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center mb-2 px-5">
              <Text className="text-text font-bold text-h6">คอร์สยอดนิยม</Text>
              <Image
                source={AppIcons.COURSE.NORMAL.POP_TEACHER}
                className="w-6 h-6 ml-2"
                resizeMode="contain"
              />
            </View>

            <ScrollView
              horizontal
              contentContainerStyle={{
                paddingBottom: 20,
                paddingHorizontal: 15,
              }}
              showsHorizontalScrollIndicator={false}
            >
              {popularCourses.map((course) => (
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
                  coins={course.price_coins ?? 0}
                  onPress={() =>
                    router.push(`/(protected)/course/${course.id}` as any)
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---(All Courses Section)--- */}
        <View className="px-5 mt-2">
          <Text className="text-text font-bold text-h6 mb-2">คอร์สทั้งหมด</Text>
          <CourseHorizontalList
            courses={courseItems}
            onPressItem={(course) =>
              router.push(`/(protected)/course/${course.id}` as any)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TeacherProfileScreen;
