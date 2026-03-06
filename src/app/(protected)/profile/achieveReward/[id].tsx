import RewardPage, {
  AchievementOverrideParams,
} from "@/src/components/RewardPage";
import { mockAchievements } from "@/src/constants/mockAchivement";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function AchiveRewardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find achievement from id
  const achievement = mockAchievements.find((a) => String(a.id) === String(id));

  // Not found
  if (!achievement) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text text-h5 font-regular">เกิดข้อผิดพลาด</Text>
        <Text className="text-text text-body font-regular">
          กรุณาลองใหม่อีกครั้งภายหลัง
        </Text>
      </View>
    );
  }

  const overrideParams: AchievementOverrideParams = {
    missionId: String(achievement.id),
    rewardType: "achievement",
    achievementName: achievement.name,
    achievementImage: achievement.image, // ImageSourcePropType จาก mockAchievements
    xp: String(achievement.xp_reward ?? 0),
    coins: String(achievement.coin_reward ?? 0),
    energy: String(achievement.energy_reward ?? 0),
  };

  return <RewardPage overrideParams={overrideParams} />;
}
