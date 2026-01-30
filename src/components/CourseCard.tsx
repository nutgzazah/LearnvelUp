import { Image, Text, TouchableOpacity, View } from "react-native";

interface CourseCardProps {
  courseImage: any;
  avatarImage: any;
  courseName: string;
  coins: number;
  onPress?: () => void;
}

export default function CourseCard({
  courseImage,
  avatarImage,
  courseName,
  coins,
  onPress,
}: CourseCardProps) {
  const coinIcon = require("../../assets/images/coin-icon.png");

  return (
    <TouchableOpacity onPress={onPress} className="mx-2 my-1">
      <View className="bg-card p-2 rounded-[15px] items-center w-[350px] shadow-sm">
        {/* Course Image */}
        <Image
          source={courseImage}
          className="w-[340px] h-[190px] rounded-t-[10px]"
          resizeMode="stretch"
        />

        <View className="flex-row gap-1 items-center p-2">
          {/* Teacher Image */}
          <Image
            source={avatarImage}
            className="w-12 h-12 mx-1 rounded-full border-primary border-2 mr-2"
          />
          {/* Course Name */}
          <Text
            className="text-text font-regular text-small mx-1 flex-1 "
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {courseName}
          </Text>
          <View className="flex-row mx-1">
            <Image source={coinIcon} className="w-7 h-7" />
            <Text className="font-bold text-wrap text-small text-secondary">
              {" "}
              {coins}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
