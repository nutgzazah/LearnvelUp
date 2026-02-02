import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const recommendIcon = require("../../../../assets/images/home/recommend-icon.png");
  const fireIcon = require("../../../../assets/images/home/fire-icon.png");
  const categoryIcon = require("../../../../assets/images/home/category-icon.png");
  const popularIcon = require("../../../../assets/images/home/popular-icon.png");

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
              source={recommendIcon}
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

        {/* ---(Hot Course Section)--- */}
        <View>
          <View className="flex-row mt-2 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สใหม่มาแรง
            </Text>
            <Image
              source={fireIcon}
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
            {mockCourseData.slice(0, 2).map((course) => (
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

        {/*---(Category Course Section)--- */}
        <View>
          <View className="flex-row mt-4 items-center mb-2 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สทั้งหมดแบ่งตามหมวดหมู่
            </Text>
            <Image
              source={categoryIcon}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          <View className="px-4">
            <TouchableOpacity>
              <Text className="text-text font-regular text-body">
                โปรแกรมมิ่ง {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View>

          <View className="px-4 mt-2">
            <TouchableOpacity>
              <Text className="text-text font-regular text-body">
                คณิตศาสตร์ {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View>

          <View className="px-4 mt-2">
            <TouchableOpacity>
              <Text className="text-text font-regular text-body">
                อื่น ๆ {" >"}
              </Text>
            </TouchableOpacity>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              limit={2}
              onPressItem={(course) => console.log(course.title)}
            />
          </View>
        </View>

        {/* ---(Popular Course Section)--- */}
        <View>
          <View className="flex-row mt-8 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">
              คอร์สใหม่มาแรง
            </Text>
            <Image
              source={popularIcon}
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
