import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { AppIcons } from "../constants/icons";
import { addCourseToWishlist, getCategories, getCourseById, isCourseInWishlist, removeCourseFromWishlist } from "../services/course-service";
import { Categories } from "../types/categories";
import { Chapter } from "../types/chapters";
import { Course } from "../types/course";

const CourseDetail = () => {
  const { id } = useLocalSearchParams();

  const [course, setCourse] = useState<Course | null>(null);

  const [categories, setCategories] = useState<Categories[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);


  const getCategoryName = (id?: number | null) => {
    if (!id) return null;
    return categories.find(c => c.id === id)?.name || null;
  };

  const categoryNames = useMemo(() => {
    if (!course) return [];

    const names = [
      getCategoryName(course.category_id),
      getCategoryName(course.sub_category_1_id),
      getCategoryName(course.sub_category_2_id),
    ].filter((name): name is string => Boolean(name));

    return [...new Set(names)];
  }, [course, categories]);

  const handleToggleWishlist = async () => {
    if (!course?.id || wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await removeCourseFromWishlist(course.id);
        setIsWishlisted(false);
      } else {
        await addCourseToWishlist(course.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("toggle wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const courseId = Number(id);

        const [courseData, categoryData, wishlistStatus] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
          isCourseInWishlist(courseId),
        ]);

        setCourse(courseData);
        setCategories(categoryData);
        setIsWishlisted(wishlistStatus);
      } catch (err) {
        console.error("fetch course detail error:", err);
      }
    };

    fetchData();
  }, [id]);


  const [activeTab, setActiveTab] = React.useState<"description" | "chapter" | "learning_outcome">(
    "description",
  );
  const chatIcon = require("../../assets/images/course/course-chat-icon.png");

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";
  if (!course) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
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
        {/* ---(Course Thumbnail)--- */}
        <View className="items-center">
          <Image
            source={{
              uri: course.cover_image_url || "https://via.placeholder.com/300",
            }}
            className="w-[400px] h-[220px]"
            resizeMode="stretch"
          />
        </View>

        {/* ---(Course Title + Category)--- */}
        <View className="px-4 mt-4">
          <Text className="text-h6 text-text font-regular">{course.title}</Text>
          <View className="flex-row flex-wrap mt-2">
          {categoryNames.map((name, index) => (
              <View
                key={`${name}-${index}`}
                className="bg-primary rounded-[14px] px-4 py-2 mr-2 mb-2 self-start"
              >
                <Text className="text-white font-regular text-tiny">
                  {name}
                </Text>
              </View>
           ))}
           </View>
        </View>

        {/* ---(Teacher + Learner Count)--- */}
        <View className="flex-row items-center justify-between px-4 mt-4">
          <TouchableOpacity
            onPress={() => {
              if (!course.instructors?.id) return;

              router.push({
                pathname: "/course/teacher/[id]",
                params: { id: String(course.instructors.id) },
              });
            }}
          >
            <View className="flex-row items-center gap-2">
              <Image
                source={{
                  uri:
                    course.instructors?.avatar_url ||
                    "https://via.placeholder.com/100",
                }}
                className="w-10 h-10 rounded-full"
              />
              <View className="flex-row items-center gap-1">
                <Text className="text-text font-regular text-body">
                  {course.instructors?.username || "-"}
                </Text>
                {/*Check mark icon*/}
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-1">
            <Text className="text-text font-regular text-body">
              ผู้เรียน {course.total_enrolled ?? 0}
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.LEARNERS}
              className="w-7 h-7"
            />
          </View>
        </View>

        {/* ---(Tab Bar)--- */}
        <View className="flex-row mt-4 px-4 items-center gap-6 justify-center ">
          <TouchableOpacity
            className={`border-b-2 px-6 ${
              activeTab === "learning_outcome"
                ? "border-primary"
                : "border-transparent"
            }`}
            onPress={() => setActiveTab("learning_outcome")}
          >
            <Text
              className={`font-regular text-body mb-2 ${
                activeTab === "learning_outcome"
                  ? "text-primary"
                  : "text-text"
              }`}
            >
              ผลการเรียนรู้
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "description" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("description")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "description" ? "text-primary" : "text-text"}`}
            >
              รายละเอียด
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "chapter" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("chapter")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "chapter" ? "text-primary" : "text-text"}`}
            >
              บทเรียนทั้งหมด
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---(Tab Content)--- */}
        {activeTab === "description" ? (
          <DescriptionTab description={course.description ?? ""} />
        ) : activeTab === "learning_outcome" ? (
          <LearningOutcomeTab learning={course.learning_outcome ?? ""} />
        ) : (
          <ChapterTab chapters={course.chapters || []} />
        )}
      </ScrollView>

      {/* ---(Bottom Buy Bar)--- */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-4 py-4 bg-background border-t border-gray-200">
        <TouchableOpacity className="flex-1 bg-primary rounded-xl py-4 items-center mr-3 my-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-bold text-body">
              ซื้อคอร์สเรียน
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.BUY}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center px-1 py-3 gap-1">
          <Text className="text-secondary text-body font-bold">
            {course.price_coins}
          </Text>
        </View>
        <Image
          source={AppIcons.HEADERS.NORMAL.COIN}
          className="w-7 h-7"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="m-2 p-1"
          onPress={handleToggleWishlist}
          disabled={wishlistLoading}
        >
          <Image
            source={
              isWishlisted
                ? AppIcons.COURSE.NORMAL.WISHLIST.ACTIVE
                : AppIcons.COURSE.NORMAL.WISHLIST.NORMAL[theme]
            }
            className="w-7 h-7"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DescriptionTab = ({ description }: { description: string }) => {
  const lines =
    description
      ?.split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0) || [];

  return (
    <View className="px-4 mt-4">
      {lines.length > 0 ? (
        lines.map((line, index) => (
          <Text
            key={index}
            className="text-text font-regular text-body leading-8 ml-2 mb-2"
          >
            {line}
          </Text>
        ))
      ) : (
        <Text className="text-gray-400 text-body">ไม่มีรายละเอียด</Text>
      )}
    </View>
  );
};

const LearningOutcomeTab = ({
  learning,
}: {
  learning?: string | null;
}) => {
  const items =
    learning
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0) || [];

  return (
    <View className="px-4 mt-4">
      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} className="flex-row items-start mb-4">
            <Text className="w-6 text-center text-text text-lg leading-7">
              •
            </Text>
            <Text className="flex-1 text-text font-regular text-body leading-7">
              {item}
            </Text>
          </View>
        ))
      ) : (
        <Text className="text-gray-400 text-body">ไม่มีข้อมูล</Text>
      )}
    </View>
  );
};

const ChapterTab = ({ chapters }: { chapters: Chapter[] }) => (
  <View className="px-4 mt-4">
    <View className="flex-row justify-between mb-4">
      <Text className="text-text font-regular text-body">
        จำนวน {chapters.length} บท
      </Text>
      <Text className="text-text font-regular text-body">
        ความยาวรวม{" "}
        {formatDuration(
          chapters.reduce((sum, chapter) => sum + (chapter.duration_seconds ?? 0), 0)
        )}
      </Text>
    </View>

    {chapters.map((chapter, index) => (
      <ChapterItem
        key={chapter.id}
        chapter={{
          id: chapter.id,
          title: chapter.title,
          duration: formatDuration(chapter.duration_seconds),
          locked: index !== 0,
        }}
      />
    ))}
  </View>
);

const formatDuration = (seconds?: number | null) => {
    if (seconds == null) return "--:--";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// ---(Chapter Item)---
const ChapterItem = ({
  chapter,
}: {
  chapter: { id: number; title: string; duration: string; locked: boolean };
}) => (
  <TouchableOpacity
    disabled={chapter.locked}
    onPress={() => router.push(`/course/lesson/${chapter.id}` as any)}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center bg-background rounded-xl mb-3 overflow-hidden shadow-sm border border-gray-200">
      {/* Thumbnail placeholder */}
      <View className="w-[100px] h-[80px] bg-gray justify-center items-center">
        <Ionicons name="play-circle-outline" size={28} color="#aaa" />
        {/* MOCK IMAGE */}
      </View>

      {/* Info */}
      <View className="flex-1 px-3">
        <Text className="text-text font-regular text-tiny" numberOfLines={2}>
          {chapter.title}
        </Text>
        <Text className="text-gray-400 font-regular text-tiny mt-1">
          {chapter.duration}
        </Text>
      </View>

      {/* Lock icon */}
      {chapter.locked && (
        <View className="pr-2">
          <Image
            source={AppIcons.COURSE.NORMAL.LOCK}
            className="w-7 h-7"
            resizeMode="contain"
          />
        </View>
      )}

      {/* Play icon for unlocked chapters */}
      {!chapter.locked && (
        <View className="pr-2">
          <Image
            source={AppIcons.COURSE.NORMAL.PLAY}
            className="w-7 h-7"
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  </TouchableOpacity>
);
export default CourseDetail;
