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
  progress = 0, // ให้ค่าเริ่มต้นเป็น 0
  onPress,
}: CourseCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-2 my-2"
      activeOpacity={0.8}
    >
      <View className="bg-card p-3 rounded-[20px] w-[350px] shadow-sm ">
        {/* Course Image */}
        <Image
          source={
            typeof courseImage === "string" ? { uri: courseImage } : courseImage
          }
          className="w-full h-[170px] rounded-[12px]"
          resizeMode="cover"
        />

        {/* Info Section */}
        <View className="flex-row items-center mt-3 px-1 gap-3 mb-1">
          {/* Teacher Avatar */}
          <Image
            source={
              typeof avatarImage === "string"
                ? { uri: avatarImage }
                : avatarImage
            }
            className="w-12 h-12 rounded-full border border-primary/20 bg-gray-100"
          />

          {/* Text & Progress */}
          <View className="flex-1 justify-center">
            <Text
              className="text-text font-regular text-small mb-2 leading-5"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {courseName}
            </Text>

            <View className="flex-row items-center gap-2">
              {/* Progress Bar Track */}
              <View className="flex-1 h-2.5 bg-primary/10 border border-primary rounded-full overflow-hidden">
                {/* Progress Bar Fill */}
                <View
                  className="h-full bg-primary rounded-full border border-background "
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="font-bold text-small  text-primary w-11 text-right">
                {Math.round(progress)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
