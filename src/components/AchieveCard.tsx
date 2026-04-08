import { Image, Text, TouchableOpacity, View } from "react-native";
import { Achievement } from "../constants/mockAchivement";

interface AchievementCardProps {
  achievement: Achievement;
  onClaimPress?: (id: number) => void;
  onRemovePress?: (id: number) => void;
}

export default function AchievementCard({
  achievement,
  onClaimPress,
  onRemovePress,
}: AchievementCardProps) {
  {
    /*---(Not Claim)---*/
  }
  if (!achievement.is_claimed) {
    return (
      <View className="flex-row gap-4 mb-4 mx-4 rounded-2xl items-center bg-background">
        {/* Image + Name */}
        <View className="items-center w-30">
          <View className="w-28 h-28 rounded-full border-2 border-disablebg overflow-hidden mb-2">
            <Image
              source={achievement.image}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Text className="text-text text-tiny text-wrap font-bold text-center w-24">
            {achievement.name}
          </Text>
        </View>

        {/* Detail Progress + Button */}
        <View className="flex-1 justify-center gap-1">
          {/* Detail */}
          <Text className="text-disabletext text-small font-regular">
            {achievement.detail}
          </Text>

          {/* Progress text */}
          <Text className="text-primary font-bold text-small">
            {achievement.progress}/100
          </Text>

          {/* Progress Bar */}
          <View className="border-2 border-primary rounded-full overflow-hidden">
            <View className="bg-background rounded-full h-4 overflow-hidden border-2 border-background">
              <View
                className="bg-primary h-full rounded-full"
                style={{ width: `${achievement.progress}%` }}
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={() => onClaimPress?.(achievement.id)}
            disabled={!achievement.is_completed}
            className={`self-start rounded-lg py-1 mt-2 px-6 ${
              achievement.is_completed ? "bg-primary" : "bg-disabletext/50"
            }`}
          >
            <Text
              className={`font-bold text-center text-tiny ${
                achievement.is_completed ? "text-white" : "text-disabletext"
              }`}
            >
              รับ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  {
    /*---(Claim)---*/
  }
  return (
    <View className="items-center mb-4">
      <View className="w-28 h-28 rounded-full border-2 mb-2 overflow-hidden border-primary">
        <Image
          source={achievement.image}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text className="text-text text-tiny font-bold text-center mb-2">
        {achievement.name}
      </Text>

      {/* Achieved but not equip */}
      {!achievement.is_used && (
        <TouchableOpacity
          onPress={() => onClaimPress?.(achievement.id)}
          className="bg-primary border border-primary rounded-lg py-2 px-2 w-36"
        >
          <Text className="text-white font-bold text-center">สวมใส่</Text>
        </TouchableOpacity>
      )}

      {/* Achieved and equip */}
      {achievement.is_used && (
        <TouchableOpacity
          onPress={() => onRemovePress?.(achievement.id)}
          className="bg-background border border-primary rounded-lg py-2 px-2 w-36"
        >
          <Text className="text-primary font-bold text-center">ยกเลิก</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
