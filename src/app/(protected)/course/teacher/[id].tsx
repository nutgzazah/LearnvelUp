import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList, {
  CourseItem,
} from "@/src/components/CourseHorizontalList";
import { AppIcons } from "@/src/constants/icons";
import {
  getInstructorById,
  getPublishedCoursesByInstructorId,
} from "@/src/services/course-service";
import { Course } from "@/src/types/course";
import { Instructor } from "@/src/types/instructor";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

const TeacherProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [teacher, setTeacher] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const courseItems = useMemo<CourseItem[]>(() => {
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      categories: [],
      thumbnail: {
        uri: course.cover_image_url || "https://via.placeholder.com/300",
      },
      price_coin: course.price_coins ?? 0,
    }));
  }, [courses]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!id) return;

        const teacherId = Number(id);
        if (Number.isNaN(teacherId)) return;

        const [teacherData, teacherCourses] = await Promise.all([
          getInstructorById(teacherId),
          getPublishedCoursesByInstructorId(teacherId),
        ]);

        setTeacher(teacherData);
        setCourses(teacherCourses);
      } catch (error) {
        console.error("fetchTeacherData error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  const totalLearners = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.total_enrolled ?? 0), 0);
  }, [courses]);

  const popularCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => (b.total_enrolled ?? 0) - (a.total_enrolled ?? 0))
      .slice(0, 5);
  }, [courses]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
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
        <View className="px-4 mt-1 gap-5">
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: teacher.avatar_url || "https://via.placeholder.com/100",
              }}
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
            <View className="flex-row items-center gap-2">
              <Text className="text-text font-regular text-h6">
                {teacher.username || "-"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <Text className="text-text font-regular text-body">
              ผู้เรียน {totalLearners}
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.LEARNERS}
              className="w-7 h-7"
            />
          </View>

          {/* ---(Teacher Bio)--- */}
          <View>
            <Text className="text-text font-regular text-body bg-background border-2 border-primary p-3 rounded-xl">
              {teacher.bio?.trim() || "ไม่มีคำอธิบายผู้สอน"}
            </Text>
          </View>
        </View>

        {/* ---(Popular Course Section)--- */}
        <View>
          <View className="flex-row mt-4 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
            <Image
              source={AppIcons.COURSE.NORMAL.POP_TEACHER}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: 10,
            }}
            showsHorizontalScrollIndicator={false}
          >
            {popularCourses.map((course) => (
              <CourseCard
                key={course.id}
                courseImage={{
                  uri: course.cover_image_url || "https://via.placeholder.com/300",
                }}
                avatarImage={{
                  uri:
                    course.instructors?.avatar_url ||
                    "https://via.placeholder.com/100",
                }}
                courseName={course.title}
                coins={course.price_coins ?? 0}
                onPress={() => console.log("Course ID:", course.id)}
              />
            ))}
          </ScrollView>

          <View className="px-4">
            <Text className="text-text font-regular text-h6">คอร์สทั้งหมด</Text>
            <CourseHorizontalList
              courses={courseItems}
              onPressItem={(course) => console.log(course.title)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TeacherProfileScreen;
