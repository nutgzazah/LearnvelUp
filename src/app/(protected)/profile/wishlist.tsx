import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
import React from "react";
import { ScrollView, View } from "react-native";

const ProfileWishlistScreen = () => {
  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
      >
        <CourseHorizontalList
          courses={mockHorizontalCourses}
          onPressItem={(course) => console.log(course.title)}
        />
      </ScrollView>
    </View>
  );
};

export default ProfileWishlistScreen;
