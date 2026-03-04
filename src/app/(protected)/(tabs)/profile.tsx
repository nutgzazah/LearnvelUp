import CourseCard from "@/src/components/CourseCard";
import ProgressCircle from "@/src/components/ProgressCircle";
import { AppIcons } from "@/src/constants/icons";
import { mockAchievements } from "@/src/constants/mockAchivement";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const avatarImage = require("../../../../assets/avatar/otterPrimaryBG.png");

export default function ProfileScreen() {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("คอร์สทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectCourse = (courseTitle: string) => {
    setSelectedCourse(courseTitle);
    setShowDropdown(false);
    setSearchQuery("");
  };
  const dropdownOptions = [
    { id: 0, title: "คอร์สทั้งหมด" },
    ...mockCourseData.map((course) => ({ id: course.id, title: course.title })),
  ];
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return dropdownOptions.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ยืนยัน",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/*---(User Pic Section)---*/}
        <View className="relative mb-16">
          <View className="h-48 bg-primary w-full justify-between p-6 pt-12 flex-row items-start"></View>
          <View className="absolute -bottom-12 self-center">
            <View className="w-36 h-36 rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom">
              <Image
                source={avatarImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="absolute bottom-0 right-0 bg-secondary px-2 py-0.5 rounded-full border-2 border-background">
              <Text className="text-white text-tiny font-bold">🎓 8</Text>
            </View>
          </View>
        </View>

        {/*---(User Info Section)---*/}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-h5 font-bold text-text">
              {user?.username || "Guest User"}
            </Text>
            <View className="bg-alert px-2 py-0.5 rounded-full">
              <Text className="text-text text-tiny font-bold">🔥 12</Text>
            </View>
          </View>

          <Text className="text-body text-disabletext text-center mt-0.5">
            {user?.email || "user@example.com"}
          </Text>
        </View>

        {/*---(Progress Section)---*/}
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

          {/*---(Dropdown Button)--- */}
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

            {/* Dropdown List with Search */}
            {showDropdown && (
              <View className="absolute top-full left-0 right-0 bg-card rounded-xl border border-primary mt-1 z-50 shadow-lg">
                {/* Search Input */}
                <View className="px-3 py-2 border-b border-disabletext">
                  <TextInput
                    placeholder="ค้นหาคอร์ส..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-white rounded-lg px-3 py-2 text-text font-regular text-small border border-primary"
                  />
                </View>

                {/* Options List */}
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
          {/* Overlay to close dropdown */}
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

          {/* Progress Circles */}
          <View className="flex-row justify-center gap-8 mt-2">
            <ProgressCircle title="วิดีโอ" completed={12} total={12} />
            <ProgressCircle title="ควิซ" completed={3} total={8} />
          </View>
        </View>

        {/*---(Achivement Section)---*/}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.push("/profile/achieve")}>
            <Text className="text-h6 font-regular text-text mb-2 px-4">
              เหรียญตราความสำเร็จ {">"}
            </Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {mockAchievements /* .slice(0, 5) */
              .map((achieve) => (
                <View
                  key={achieve.id}
                  className="items-center justify-center mt-2 mx-2"
                >
                  <Image
                    source={achieve.image.mock_achieve1}
                    className="w-28 h-28 mb-2 rounded-full border-2 border-primary"
                    resizeMode="contain"
                  />
                  <Text className="text-primary text-tiny font-bold text-center">
                    {achieve.name}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>

        {/* ---(Wishlist Course Section)--- */}
        <View>
          <View className="flex-row items-center mb-1 px-4">
            <TouchableOpacity onPress={() => router.push("/profile/wishlist")}>
              <Text className="text-text font-regular text-h6">
                คอร์สที่อยากได้ {">"}
              </Text>
            </TouchableOpacity>
          </View>
          {/*---(Scroll Course)--- */}
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {mockCourseData.slice(0, 5).map((course) => (
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

        <View className="px-6 mt-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full border border-alert bg-background rounded-full py-3 items-center"
          >
            <Text className="text-alert font-bold text-body">ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        <Link href="/designSystem" className="mt-12 items-center">
          <Text className="mt-3 text-center">Design System</Text>
        </Link>
      </ScrollView>
    </View>
  );
}
