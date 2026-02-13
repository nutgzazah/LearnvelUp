import { Image, Text, TouchableOpacity, View } from "react-native";

interface CourseCardProps {
  courseImage: any;
  avatarImage: any;
  courseName: string;
  progress?: number;
  onPress?: () => void;
}

export default function CourseCardProgress({
  courseImage,
  avatarImage,
  courseName,
  progress,
  onPress,
}: CourseCardProps) {
  return (
    <TouchableOpacity onPress={onPress} className="mx-2 my-1">
      <View className="bg-card p-2 rounded-[15px] items-center w-[350px] shadow-sm">
        {/* Course Image */}
        <Image
          source={courseImage}
          className="w-[340px] h-[160px] rounded-t-[10px]"
          resizeMode="stretch"
        />

        <View className="flex-row justify-between items-center py-2 px-8">
          {/* Teacher Image */}
          <View className="items-center justify-start mx-auto">
            <Image
              source={avatarImage}
              className="w-12 h-12 mx-1 rounded-full border-primary border-2"
            />
          </View>
          <View>
            {/* Course Name */}
            <Text
              className="text-text font-regular text-small mx-1 flex-1 "
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {courseName}
            </Text>
            <View className="mx-1 flex-row items-center">
              <View className="w-[250px] h-3 bg-background rounded-full overflow-hidden border-2 border-primary">
                <View
                  className="h-2 bg-primary rounded-full"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </View>
              <Text className="font-regular text-wrap text-small text-primary ml-1 items-center justify-end">
                {progress ? `${progress}%` : "0%"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
