import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const TeacherProfileScreen = () => {
  // Use course id=3 to match the images (Python Zero to Hero)
  const course = mockCourseData.find((c) => c.id === 3)!;

  const backIcon = require("../../../../../assets/images/back-icon.png");
  const learnerIcon = require("../../../../../assets/images/course/course-learners-icon.png");
  const popularTeacherIcon = require("../../../../../assets/images/course/course-popular-teacher-icon.png");

  const [showAll, setShowAll] = useState(false);
  const hasMoreCourses = mockHorizontalCourses.length > 5; // สมมติว่ามีคอร์สทั้งหมดมากกว่า 5 คอร์ส

  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-14 left-3 z-10 bg-white/70 rounded-full p-2"
      >
        <Image source={backIcon} className="w-5 h-5" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 50 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
      >
        <View className="px-4 mt-10 gap-5">
          <View className="flex-row items-center gap-4">
            <Image
              source={course.teacherAvatar}
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
            <View className="flex-row items-center gap-2">
              <Text className="text-text font-regular text-h6">DevMastery</Text>
              {/*Check mark icon*/}
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-text font-regular text-body">
              ผู้เรียน 2,080 {/* Hardcoded learner count */}
            </Text>
            <Image source={learnerIcon} className="w-7 h-7" />
          </View>

          {/* ---(Teacher Bio)--- */}
          <View>
            <Text
              className="text-text font-regular text-body bg-background border-2 border-primary p-3 rounded-xl"
              ellipsizeMode="tail"
            >
              DevMastery
              พื้นที่ของคนอยากย้ายสายงานและเริ่มต้นเขียนโปรแกรมแบบไม่เครียด
              เราเชื่อว่า "Coding" คือทักษะพื้นฐานใหม่ของโลกอนาคต ที่ใครๆ
              ก็เขียนได้ ไม่จำเป็นต้องจบตรงสาย
            </Text>
          </View>
        </View>

        {/* ---(Popular Course Section)--- */}
        <View>
          <View className="flex-row mt-4 items-center mb-1 px-4">
            <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
            <Image
              source={popularTeacherIcon}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>
          {/*---(Scroll Course)--- */}
          <ScrollView
            horizontal
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: 10,
            }}
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

          <View className="px-4 ">
            <Text className="text-text font-regular text-h6">คอร์สทั้งหมด</Text>
            <CourseHorizontalList
              courses={mockHorizontalCourses}
              onPressItem={(course) => console.log(course.title)}
            />
          </View>
        </View>

        {/* ---( Show More Button )--- */}
        {!showAll && hasMoreCourses && (
          <View className="px-4">
            <TouchableOpacity onPress={() => setShowAll(true)}>
              <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px] py-2">
                <Text className="text-primary font-regular text-body">
                  แสดงคอร์สเพิ่มเติม ({mockHorizontalCourses.length - 5} คอร์ส)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TeacherProfileScreen;
