import type { Achievement } from "@/src/services/archieveService";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AchievementCardProps {
  achievement: Achievement;
  onEquipPress?: (id: number) => void;
  onUnequipPress?: (id: number) => void;
}

export default function AchievementCard({
  achievement,
  onEquipPress,
  onUnequipPress,
}: AchievementCardProps) {
  const progressPercent =
    achievement.condition_value > 0
      ? (achievement.progress / achievement.condition_value) * 100
      : 0;

  // ป้องกันเปอร์เซ็นต์เกิน 100 หรือต่ำกว่า 0
  const displayPercent = Math.min(
    100,
    Math.max(0, Math.floor(progressPercent)),
  );

  if (!achievement.is_claimed) {
    return (
      <View className="flex-row gap-4 mb-4 mx-4 rounded-2xl items-center bg-background p-2">
        <View className="items-center w-30">
          <View className="w-24 h-24 rounded-full border-2 border-disablebg overflow-hidden mb-2 items-center justify-center opacity-50">
            {achievement.image ? (
              <Image
                source={achievement.image}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Text className="text-disabletext text-tiny">ล็อค</Text>
            )}
          </View>
          <Text className="text-text text-tiny text-wrap font-bold text-center w-24">
            {achievement.name}
          </Text>
        </View>

        <View className="flex-1 justify-center gap-1">
          <Text className="text-disabletext text-small font-regular mb-1">
            {achievement.detail}
          </Text>

          <View className="flex-row justify-between items-center">
            <Text className="text-primary font-bold text-small">
              {achievement.progress}/{achievement.condition_value}
            </Text>
            <Text className="text-primary font-bold text-tiny">
              {displayPercent}%
            </Text>
          </View>

          <View className="border border-primary/30 rounded-full overflow-hidden mb-2">
            <View className="bg-background rounded-full h-3 overflow-hidden">
              <View
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${displayPercent}%`,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="items-center mb-4">
      <View className="w-28 h-28 rounded-full border-2 mb-2 overflow-hidden border-primary items-center justify-center bg-background shadow-sm">
        {achievement.image ? (
          <Image
            source={achievement.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : null}
      </View>

      <Text className="text-text text-tiny font-bold text-center mb-2 px-1">
        {achievement.name}
      </Text>

      {!achievement.is_equipped ? (
        <TouchableOpacity
          onPress={() => onEquipPress?.(achievement.id)}
          className="bg-primary rounded-full py-1.5 px-6"
        >
          <Text className="text-white font-bold text-center text-small">
            สวมใส่
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => onUnequipPress?.(achievement.id)}
          className="bg-background border-2 border-primary rounded-full py-1 px-6"
        >
          <Text className="text-primary font-bold text-center text-small">
            ถอดออก
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
