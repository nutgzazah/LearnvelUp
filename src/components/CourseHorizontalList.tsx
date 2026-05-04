import { useRouter } from "expo-router";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppIcons } from "../constants/icons";

export interface CourseItem {
  id: number;
  title: string;
  categories: string[];
  thumbnail: ImageSourcePropType | string;
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
            <Image
              source={
                typeof course.thumbnail === "string"
                  ? { uri: course.thumbnail }
                  : course.thumbnail
              }
              className="w-40 h-24 rounded-[5px]"
              resizeMode="stretch"
            />

            <View className="flex-1 flex-row justify-between">
              <View className="flex-1 gap-2 pr-2">
                <Text
                  className="text-text font-regular text-small"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {course.title}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {(course.categories ?? []).map((category, index) => (
                    <Text
                      key={`${course.id}-${category}-${index}`}
                      className="self-start text-white font-regular text-tiny rounded-[10px] bg-primary px-2 py-1"
                    >
                      {category}
                    </Text>
                  ))}
                </View>
              </View>

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