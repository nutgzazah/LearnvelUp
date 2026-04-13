import CourseCard from "@/src/components/CourseCard";
import { AppIcons } from "@/src/constants/icons";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { getPublishedCourses } from "@/src/services/course-service";
import { Course } from "@/src/types/course";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const onPressCategory = () => {
    router.push("/(protected)/home/[id]");
  };

  const [testData, setTestData] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courses = await getPublishedCourses();
        setTestData(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setTestData([]);
      }
    };

    fetchCourse();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---(Recommend Section)--- */}
        <View>
          <View className="flex-row mt-2 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              แนะนำสำหรับคุณ
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.RECOMMEND}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          {/*---(Scroll Course)--- */}
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {mockCourseData.map((course) => (
              <CourseCard
                key={course.id}
                courseImage={course.thumbnail}
                avatarImage={course.teacherAvatar}
                courseName={course.title}
                coins={course.price_coin}
                onPress={() => router.push("/(protected)/course/[id]")}
              />
            ))}
          </ScrollView>
        </View>

        {/* ---(Hot Course Section)--- */}
        <View>
          <View className="flex-row mt-2 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สใหม่มาแรง
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.HOT}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          {/*---(Scroll Course)--- */}
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {testData &&
              testData.map((course) => (
                <CourseCard
                  key={course.id}
                  courseImage={{
                    uri:
                      course.cover_image_url ||
                      "https://via.placeholder.com/150",
                  }}
                  // รูปคนสอน (ดึงจากตาราง instructors)
                  avatarImage={{
                    uri:
                      course.instructors?.avatar_url ||
                      "https://via.placeholder.com/150",
                  }}
                  courseName={course.title}
                  coins={course.price_coins}
                  onPress={() => router.push(`/(protected)/course/${course.id}`)}
                />
              ))}
          </ScrollView>
        </View>

        {/*---(Category Course Section)--- */}
        <View>
          <View className="flex-row mt-4 items-center mb-2 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สทั้งหมดแบ่งตามหมวดหมู่
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.CATEGORY}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          {/* <View className="px-4">
            <TouchableOpacity onPress={onPressCategory}>
              <Text className="text-text font-regular text-body">
                โปรแกรมมิ่ง {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View> */}

          {/* <View className="px-4 mt-2">
            <TouchableOpacity onPress={onPressCategory}>
              <Text className="text-text font-regular text-body">
                คณิตศาสตร์ {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View> */}

          {/* <View className="px-4 mt-2">
            <TouchableOpacity onPress={onPressCategory}>
              <Text className="text-text font-regular text-body">
                อื่น ๆ {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View> */}
        </View>

        {/* ---(Popular Course Section)--- */}
        <View>
          <View className="flex-row mt-8 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สใหม่มาแรง
            </Text>
            <Image
              source={AppIcons.HOME.NORMAL.POPULAR}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          {/*---(Scroll Course)--- */}
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {mockCourseData.map((course) => (
              <CourseCard
                key={course.id}
                courseImage={course.thumbnail}
                avatarImage={course.teacherAvatar}
                courseName={course.title}
                coins={course.price_coin}
                onPress={() => console.log("Course ID:", course.id)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
