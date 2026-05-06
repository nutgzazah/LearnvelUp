import { AppIcons } from "@/src/constants/icons";
import { type CourseScore } from "@/src/lib/recommendation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  course: CourseScore;
  showScore?: boolean; // dev mode — แสดง similarity score
}

const RecommendedCourseCard = ({ course, showScore = false }: Props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => router.push(`/course/${course.course_id}` as any)}
        activeOpacity={0.85}
        className="mx-2 my-1 "
      >
        <View className="bg-card p-2 rounded-[15px] items-center w-[350px] shadow-sm">
          {/* Course Image */}
          <View className="w-[340px] h-[190px] bg-disablebg rounded-t-[10px] items-center justify-center overflow-hidden">
            {course.cover_image_url ? (
              <Image
                source={{ uri: course.cover_image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="play-circle-outline" size={48} color="#aaa" />
            )}
          </View>

          {/* Info Row */}
          <View className="flex-row gap-1 items-center p-2">
            {/* Avatar */}
            {course.teacher_avatar_url ? (
              <Image
                source={{ uri: course.teacher_avatar_url }}
                className="w-12 h-12 mx-1 rounded-full border-primary border-2 mr-2"
              />
            ) : (
              <View className="w-12 h-12 mx-1 rounded-full border-primary border-2 mr-2 bg-disablebg items-center justify-center">
                <Ionicons name="book" size={20} color="#ccc" />
              </View>
            )}

            {/* Course Name */}
            <Text
              className="text-text font-regular text-small mx-1 flex-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {course.title}
            </Text>

            {/* Price */}
            <View className="flex-row mx-1">
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-7 h-7"
              />
              <Text className="font-bold text-wrap text-small text-secondary">
                {" "}
                {course.price_coins ?? "0"}
              </Text>
            </View>

            {/* Dev-only: Score badge */}
            {showScore && course.score > 0 && (
              <View className="ml-2 bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-success font-regular text-tiny">
                  {Math.round(course.score * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity
          onPress={() =>
            console.log("URL:", process.env.EXPO_PUBLIC_RECOMMENDATION_URL)
          }
          className="items-center"
        >
          <Text className="text-primary font-bold text-tiny">
            Check Recommendation API URL
          </Text>
        </TouchableOpacity> Dev-only: Check API URL*/}
    </View>
  );
};

export default RecommendedCourseCard;
