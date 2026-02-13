import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const SearchScreen = () => {
  const hotCategoryIcon = require("../../../../assets/images/search/search-fire-icon.png");
  const interestIcon = require("../../../../assets/images/search/search-interest-icon.png");
  const searchResultIcon = require("../../../../assets/images/search/search-result-icon.png");

  const { q } = useLocalSearchParams<{ q?: string }>();

  const searchResults = useMemo(() => {
    if (!q || q.trim() === "") return [];

    return mockHorizontalCourses.filter((course) =>
      `${course.title} ${course.category}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }, [q]);

  /* ---( SEARCH RESULT MODE )--- */
  if (q && q.trim() !== "") {
    return (
      <View className="flex-1 bg-background px-4 pt-2">
        <View className="items-center flex-row mt-2">
          <Text className="text-text font-regular text-h6 mb-3">
            ผลลัพธ์การค้นหา
          </Text>
          <Image
            source={searchResultIcon}
            className="w-7 h-7 ml-2 -top-1"
            resizeMode="contain"
          />
        </View>
        {searchResults.length === 0 ? (
          <View className="items-center mt-20">
            <Text className="text-disabletext text-body font-regular">
              ไม่พบผลลัพธ์ที่ตรงกับ “{q}”
            </Text>
          </View>
        ) : (
          <CourseHorizontalList
            courses={searchResults}
            onPressItem={(course) => console.log(course.title)}
          />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---(Hot Category Section)--- */}
        <View className="flex-row mt-2 items-center mb-1 px-4">
          <Text className="text-text font-regular text-h6">
            หมวดหมู่ยอดนิยม
          </Text>
          <Image
            source={hotCategoryIcon}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingBottom: 20,
            paddingHorizontal: 10,
            gap: 5,
            marginTop: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {mockHorizontalCourses.map((category) => (
            <View key={category.id}>
              <Text className="self-start text-white font-regular text-tiny rounded-[10px] bg-primary px-2 py-1">
                {category.category}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ---(Interest Section)--- */}
        <View className="flex-row px-4 mt-2 items-center">
          <Text className="text-text font-regular text-h6 mb-2">
            คุณอาจสนใจ
          </Text>
          <Image
            source={interestIcon}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        </View>
        <View className="px-4">
          <CourseHorizontalList
            courses={mockHorizontalCourses}
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
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
