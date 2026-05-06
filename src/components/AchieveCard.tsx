import type { Achievement } from "@/src/services/archieveService";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AchievementCardProps {
  achievement: Achievement;
  onClaimPress?: (id: number) => void;
  onEquipPress?: (id: number) => void;
  onUnequipPress?: (id: number) => void;
}

export default function AchievementCard({
  achievement,
  onClaimPress,
  onEquipPress,
  onUnequipPress,
}: AchievementCardProps) {
  if (!achievement.is_claimed) {
    return (
      <View className="flex-row gap-4 mb-4 mx-4 rounded-2xl items-center bg-background">
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

        <View className="flex-1 justify-center gap-1">
          <Text className="text-disabletext text-small font-regular">
            {achievement.detail}
          </Text>

          <Text className="text-primary font-bold text-small">
            {achievement.progress}/{achievement.condition_value}
          </Text>

          <View className="border-2 border-primary rounded-full overflow-hidden">
            <View className="bg-background rounded-full h-4 overflow-hidden border-2 border-background">
              <View
                className="bg-primary h-full rounded-full"
                style={{ width: `${achievement.progress}%` }}
              />
            </View>
          </View>

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

  return (
    <View className="items-center mb-4">
      <View className="w-28 h-28 rounded-full border-2 mb-2 overflow-hidden border-primary items-center justify-center bg-background">
        {achievement.image ? (
          <Image
            source={achievement.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : null}
      </View>

      <Text className="text-text text-tiny font-bold text-center mb-2">
        {achievement.image ? achievement.name : "ยังไม่มีเหรียญตราความสำเร็จ"}
      </Text>

      {!achievement.is_equipped && (
        <TouchableOpacity
          onPress={() => onEquipPress?.(achievement.id)}
          className="bg-primary border border-primary rounded-lg py-2 px-2 w-36"
        >
          <Text className="text-white font-bold text-center">สวมใส่</Text>
        </TouchableOpacity>
      )}

      {achievement.is_equipped && (
        <TouchableOpacity
          onPress={() => onUnequipPress?.(achievement.id)}
          className="bg-background border border-primary rounded-lg py-2 px-2 w-36"
        >
          <Text className="text-primary font-bold text-center">ยกเลิก</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}