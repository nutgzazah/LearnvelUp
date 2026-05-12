import CourseCard from "@/src/components/CourseCard";
import ProgressCircle from "@/src/components/ProgressCircle";
import { AppIcons } from "@/src/constants/icons";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AvatarDisplay from "@/src/components/AvatarDisplay";
import type { Achievement } from "@/src/services/archieveService";
import { fetchAchievements } from "@/src/services/archieveService";
import { getWishlistCourses } from "@/src/services/course-service";
import {
  fetchProfileUsername,
  fetchUserEquippedAvatar,
  fetchUserEquippedBackgroundUrl,
  fetchUserStats,
} from "@/src/services/userService";
import { Course } from "@/src/types/course";

import CardLearnPath from "@/src/components/CardLearnPath";
import {
  getUserEnrolledLearningPaths,
  LearningPath,
  UserLearningPath,
} from "@/src/services/learnpathService";

type EnrolledPath = UserLearningPath & {
  learning_path: LearningPath & { course_count: number };
};

export default function ProfileScreen() {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("คอร์สทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [equippedBackgroundUrl, setEquippedBackgroundUrl] = useState<
    string | null
  >(null);
  const [equippedAchievements, setEquippedAchievements] = useState<
    Achievement[]
  >([]);
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    level: number;
    current_streak: number | null;
  } | null>(null);

  const [enrolledPaths, setEnrolledPaths] = useState<EnrolledPath[]>([]);
  const [enrolledPathsLoading, setEnrolledPathsLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [equippedAvatarId, setEquippedAvatarId] = useState<number | null>(null);

  const handleSelectCourse = (courseTitle: string) => {
    setSelectedCourse(courseTitle);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const dropdownOptions = [
    { id: 0, title: "คอร์สทั้งหมด" },
    ...mockCourseData.map((course) => ({ id: course.id, title: course.title })),
  ];

  const filteredOptions = useMemo(() => {
    return dropdownOptions.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const loadEquippedAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const achievements = await fetchAchievements(user.id);
      const equippedOnly = achievements.filter((item) => item.is_equipped);
      setEquippedAchievements(equippedOnly);
    } catch (error) {
      console.error("load equipped achievements error:", error);
    }
  }, [user?.id]);

  const loadEnrolledPaths = useCallback(async () => {
    if (!user?.id) return;
    try {
      setEnrolledPathsLoading(true);
      const data = await getUserEnrolledLearningPaths(user.id);
      setEnrolledPaths(data as EnrolledPath[]);
    } catch (error) {
      console.error("load enrolled paths error:", error);
    } finally {
      setEnrolledPathsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadEnrolledPaths();
    }, [loadEnrolledPaths]),
  );

  useFocusEffect(
    useCallback(() => {
      const loadEquippedItems = async () => {
        const [avatarId, backgroundUrl] = await Promise.all([
          fetchUserEquippedAvatar(),
          fetchUserEquippedBackgroundUrl(),
        ]);

        setEquippedAvatarId(avatarId);
        setEquippedBackgroundUrl(backgroundUrl);
      };

      loadEquippedItems();
      loadEquippedAchievements();
    }, [loadEquippedAchievements]),
  );

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      try {
        const [avatarId, backgroundUrl, username, stats] = await Promise.all([
          fetchUserEquippedAvatar(),
          fetchUserEquippedBackgroundUrl(),
          fetchProfileUsername(user.id),
          fetchUserStats(user.id),
        ]);

        setEquippedAvatarId(avatarId);
        setEquippedBackgroundUrl(backgroundUrl);
        setProfileUsername(username);
        setUserStats(stats);
      } catch (error) {
        console.error("loadUserProfile error:", error);
      }
    };

    loadUserProfile();
  }, [user?.id]);

  const loadWishlistCourses = useCallback(async () => {
    try {
      setWishlistLoading(true);

      const data = await getWishlistCourses();
      setWishlistCourses(data);
    } catch (error) {
      console.error("load wishlist courses error:", error);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlistCourses();
    }, [loadWishlistCourses]),
  );

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mb-16">
          <View className="h-48 w-full overflow-hidden">
            {equippedBackgroundUrl ? (
              <Image
                source={{ uri: equippedBackgroundUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-48 bg-primary w-full justify-between p-6 pt-12 flex-row items-start" />
            )}
          </View>
          <View className="absolute -bottom-14 self-center">
            <View className="w-36 h-36 rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom">
              <AvatarDisplay avatarId={equippedAvatarId} />
            </View>
            <View className="absolute bottom-0 right-0 bg-secondary px-2 py-0.5 rounded-full border-2 border-background">
              <Text className="text-white text-tiny font-bold">
                🎓 {userStats?.level ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-h5 font-bold text-text">
              {profileUsername || "Guest User"}
            </Text>
            <View className="bg-alert px-2 py-0.5 rounded-full">
              <Text className="text-text text-tiny font-bold">
                🔥 {userStats?.current_streak ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 mb-6 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-h6 font-regular text-text mb-2">
              ความคืบหน้าของคุณ
            </Text>
            <Image
              source={AppIcons.PROFILE.NORMAL.PROGRESS}
              className="w-7 h-7 "
              resizeMode="contain"
            />
          </View>

          <View className="relative w-64">
            <TouchableOpacity
              onPress={() => {
                setShowDropdown(!showDropdown);
                setSearchQuery("");
              }}
              className="border border-primary bg-card rounded-lg py-2 px-4 flex-row items-center justify-between"
            >
              <Text
                className="text-primary font-regular text-small flex-1"
                numberOfLines={1}
              >
                {selectedCourse}
              </Text>
              <Image
                source={AppIcons.PROFILE.NORMAL.LIST}
                style={{
                  transform: [{ rotate: showDropdown ? "180deg" : "0deg" }],
                }}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>

            {showDropdown && (
              <View className="absolute top-full left-0 right-0 bg-card rounded-xl border border-primary mt-1 z-50 shadow-lg">
                <View className="px-3 py-2 border-b border-disabletext">
                  <TextInput
                    placeholder="ค้นหาคอร์ส..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-white rounded-lg px-3 py-2 text-text font-regular text-small border border-primary"
                  />
                </View>

                <ScrollView style={{ maxHeight: 200 }} scrollEnabled={true}>
                  {filteredOptions.map((item) => (
                    <TouchableOpacity
                      key={item.id.toString()}
                      onPress={() => handleSelectCourse(item.title)}
                      className={`px-3 py-3 border-b border-disablebg ${
                        selectedCourse === item.title ? "bg-primary/10" : ""
                      }`}
                    >
                      <Text className="text-text font-regular text-small">
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {filteredOptions.length === 0 && (
                    <View className="px-4 py-4">
                      <Text className="text-disabletext font-regular text-center">
                        ไม่พบคอร์สที่ค้นหา
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {showDropdown && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setShowDropdown(false);
                setSearchQuery("");
              }}
              className="absolute inset-0"
            />
          )}

          <View className="flex-row justify-center gap-8 mt-2">
            <ProgressCircle title="วิดีโอ" completed={12} total={12} />
            <ProgressCircle title="ควิซ" completed={3} total={8} />
          </View>
        </View>

        <View className="mb-6">
          <TouchableOpacity onPress={() => router.push("/profile/achieve")}>
            <Text className="text-h6 font-regular text-text mb-2 px-4">
              เหรียญตราความสำเร็จ {">"}
            </Text>
          </TouchableOpacity>

          {equippedAchievements.length === 0 ? (
            <View className="px-4 py-6 items-center justify-center">
              <Text className="text-disabletext text-base">
                ยังไม่ได้สวมใส่
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              contentContainerStyle={{
                paddingBottom: 20,
                paddingHorizontal: 10,
              }}
              showsHorizontalScrollIndicator={false}
            >
              {equippedAchievements.map((achieve) => (
                <View
                  key={achieve.id}
                  className="items-center justify-center mt-2 mx-2"
                >
                  {achieve.image ? (
                    <Image
                      source={achieve.image}
                      className="w-28 h-28 mb-2 rounded-full border-2 border-primary"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-28 h-28 mb-2 rounded-full border-2 border-primary bg-card items-center justify-center">
                      <Text className="text-disabletext text-tiny">
                        ไม่มีรูป
                      </Text>
                    </View>
                  )}

                  <Text className="text-text text-tiny font-bold text-center">
                    {achieve.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View>
          <View className="flex-row items-center mb-1 px-4">
            <TouchableOpacity onPress={() => router.push("/profile/wishlist")}>
              <Text className="text-text font-regular text-h6">
                คอร์สที่อยากได้ {">"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {wishlistLoading ? (
              <View className="px-4 py-6">
                <Text className="text-disabletext">กำลังโหลด...</Text>
              </View>
            ) : wishlistCourses.length > 0 ? (
              wishlistCourses.slice(0, 5).map((course) => (
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
                  coins={course.price_coins}
                  onPress={() => router.push(`/course/${course.id}` as any)}
                />
              ))
            ) : (
              <View className="px-4 py-6">
                <Text className="text-disabletext">
                  ยังไม่มีคอร์สใน Wishlist
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View>
          <View className="flex-row items-center mb-1 px-4">
            <TouchableOpacity onPress={() => router.push("/learnpath" as any)}>
              <Text className="text-text font-regular text-h6">
                เส้นทางการเรียนของคุณ {">"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {enrolledPathsLoading ? (
              <View className="px-4 py-6">
                <Text className="text-disabletext">กำลังโหลด...</Text>
              </View>
            ) : enrolledPaths.length > 0 ? (
              enrolledPaths.map((item) => (
                <CardLearnPath
                  key={item.id}
                  coverImage={{
                    uri:
                      item.learning_path.cover_image_url ||
                      "https://via.placeholder.com/390x190",
                  }}
                  title={item.learning_path.title}
                  courseCount={item.learning_path.course_count}
                  onPress={() =>
                    router.push(`/learnpath/${item.learning_path_id}` as any)
                  }
                />
              ))
            ) : (
              <View className="px-4 py-6">
                <Text className="text-disabletext">
                  ยังไม่ได้ลงทะเบียนเส้นทางการเรียน
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
