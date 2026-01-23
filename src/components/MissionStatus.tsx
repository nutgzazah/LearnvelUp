import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MissionWithProgress } from "../types/mission";

interface Mission {
  id: number;
  title: string;
  progress: number;
  completed: boolean;
  current: number;
  target: number;
  unit: string;
}

interface MissionStatusProps {
  mission: MissionWithProgress;
  missionCompleted: any;
  missionIncomplete: any;
  onMissionPress?: (mission: MissionWithProgress) => void;
}

const MissionStatus = ({
  mission,
  missionCompleted,
  missionIncomplete,
  onMissionPress,
}: MissionStatusProps) => {
  const xpIcon = require("../../assets/images/xp-icon.png");
  const coinIcon = require("../../assets/images/coin-icon.png");
  const energyIcon = require("../../assets/images/energy-icon.png");

  return (
    <TouchableOpacity
      onPress={() => mission.is_completed && onMissionPress?.(mission)}
      disabled={!mission.is_completed}
      activeOpacity={mission.is_completed ? 0.7 : 1}
    >
      <View className="mb-4 bg-background rounded-lg p-4 shadow-sm">
        {/* ---(Mission Title)--- */}
        <Text className="text-body font-medium text-text mb-1">
          {mission.name}
        </Text>

        {/* ---(Mission Description)--- */}
        {mission.description && (
          <Text className="text-small font-regular text-disabletext mb-3">
            {mission.description}
          </Text>
        )}

        {/* ---(Progress Bar and Icon)--- */}
        <View className="flex-row items-center">
          {/* ---(Progress Bar Container)--- */}
          <View className="flex-1 mr-3">
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
              <View
                className="h-full bg-purple-500 rounded-full absolute left-0 top-0"
                style={{ width: `${mission.progress_percentage}%` }}
              />
            </View>
            <Text className="text-caption text-purple-600 font-medium mt-1 text-right">
              {mission.progress_percentage}%
            </Text>
          </View>

          {/* ---(Treasure Chest Icon)--- */}
          <Image
            source={mission.is_completed ? missionCompleted : missionIncomplete}
            className="w-12 h-12 -top-4"
            resizeMode="cover"
          />
        </View>

        {/* ---(Mission Details)--- */}
        <View className="mt-1 flex-row justify-between items-center">
          <Text className="text-tiny text-disabletext font-regular">
            {mission.current_value}/{mission.target_value}{" "}
            {mission.metric_type?.unit || ""}
          </Text>
          {mission.is_completed && (
            <Text className="text-tiny text-success font-regular">
              ✓ สำเร็จ - แตะเพื่อรับรางวัล
            </Text>
          )}
          {!mission.is_completed && (
            <Text className="text-tiny text-alert font-regular">
              ✗ ยังไม่สำเร็จ
            </Text>
          )}
        </View>

        {/* ---(Reward Preview)--- */}
        <View className="mt-1 flex-row gap-2 ">
          {mission.reward_energy > 0 && (
            <View className="flex-row items-center bg-background px-2 py-1 rounded-md">
              <Text className="text-tiny text-primary font-bold">
                +{mission.reward_energy}
              </Text>
              <Image source={energyIcon} className="mx-1 w-7 h-7" />
            </View>
          )}
          {mission.reward_xp > 0 && (
            <View className="flex-row items-center bg-bacground px-2 py-1 rounded-md">
              <Text className="text-tiny text-alert font-bold">
                +{mission.reward_xp}
              </Text>
              <Image source={xpIcon} className="mx-1 w-7 h-7" />
            </View>
          )}
          {mission.reward_coins > 0 && (
            <View className="flex-row items-center bg-background px-2 py-1 rounded-md">
              <Text className="text-tiny text-secondary font-bold">
                +{mission.reward_coins}
              </Text>
              <Image source={coinIcon} className="mx-1 w-7 h-7" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MissionStatus;
