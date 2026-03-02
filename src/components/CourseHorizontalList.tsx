import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { AppIcons } from "../constants/icons";

interface CourseItem {
  id: number;
  title: string;
  category: string;
  thumbnail: any;
  price_coin: number;
}

interface CourseHorizontalListProps {
  courses: CourseItem[];
  limit?: number;
  onPressItem?: (course: CourseItem) => void;
}

export default function CourseHorizontalList({
  courses,
  limit,
  onPressItem,
}: CourseHorizontalListProps) {
  const router = useRouter();
  const displayCourses = limit ? courses.slice(0, limit) : courses;
  const handlePress = (course: CourseItem) => {
    if (onPressItem) {
      onPressItem(course);
      return;
    }

    router.push({
      pathname: "/home/[id]",
      params: { id: String(course.id) },
    });
  };

  return (
    <View className="mt-2 w-[360px]">
      {displayCourses.map((course) => (
        <TouchableOpacity
          key={course.id}
          onPress={() => handlePress(course)}
          className="mb-3"
        >
          <View className="flex-row items-start gap-2">
            {/* Thumbnail */}
            <Image
              source={course.thumbnail}
              className="w-40 h-24 rounded-[5px]"
              resizeMode="stretch"
            />

            {/* Right Content */}
            <View className="flex-1 flex-row justify-between">
              {/* Text Zone */}
              <View className="flex-1 gap-2 pr-2">
                <Text
                  className="text-text font-regular text-small"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {course.title}
                </Text>

                <Text className="self-start text-white font-regular text-tiny rounded-[10px] bg-primary px-2 py-1">
                  {course.category}
                </Text>
              </View>

              {/* Coin Zone*/}
              <View className="flex-row items-center w-16 justify-end">
                <Image
                  source={AppIcons.HEADERS.NORMAL.COIN}
                  className="w-6 h-6"
                />
                <Text className="ml-1 text-text font-bold text-small">
                  {course.price_coin === 0 ? "Free" : course.price_coin}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
