import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const courseId = Number(id);
  const course = mockHorizontalCourses.find((item) => item.id === courseId);

  const coinIcon = require("../../../../assets/images/coin-icon.png");
  const topCourseIcon = require("../../../../assets/images/home/top-course-icon.png");

  if (course) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-10 justify-center"
          >
            <Text className="text-body text-text">{"<"} Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-h6 text-text font-regular">
            ไม่พบข้อมูลคอร์ส
          </Text>
          <Text className="text-body text-disabletext font-regular mt-2">
            กรุณาลองใหม่อีกครั้ง
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 rounded-full bg-primary"
          >
            <Text className="text-body text-white font-bold">
              กลับหน้าก่อนหน้า
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 50, paddingTop: 50 }}
      showsVerticalScrollIndicator={false}
      className="bg-background"
    >
      <View>
        <View className="flex-row mt-2 items-center mb-1 px-4">
          <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
          <Image
            source={topCourseIcon}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        </View>

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

        <View className="mt-2 mb-1 px-4">
          <Text className="text-text font-regular text-h6">คอร์สทั้งหมด</Text>
          <CourseHorizontalList
            courses={mockHorizontalCourses}
            limit={5}
            onPressItem={(course) => console.log(course.title)}
          />
          <TouchableOpacity>
            <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px]">
              <Text className="text-primary font-regular text-body">
                ค้นหาคอร์สเพิ่มเติม
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
