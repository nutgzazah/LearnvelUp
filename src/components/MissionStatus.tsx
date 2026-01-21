import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
  mission: Mission;
  missionCompleted: any;
  missionIncomplete: any;
}

const MissionStatus = ({
  mission,
  missionCompleted,
  missionIncomplete,
}: MissionStatusProps) => {
  return (
    <View className="mb-4 bg-background rounded-lg border border-disablebg p-4 drop-shadow-lg">
      {/* ---(Mission Title)--- */}
      <Text className="text-body font-regular text-text mb-3 pt-2 ">
        {mission.title}
      </Text>

      {/* ---(Progress Bar and Icon)--- */}
      <View className="flex-row items-center justify-evenly">
        {/* ---(Progress Bar Container)--- */}
        <View className="flex-1 mr-4">
          {/* ---(Background Bar)--- */}
          <View className="h-2 bg-background rounded-full overflow-hidden relative">
            {/* ---(Progress Bar)--- */}
            <View
              className="h-full bg-primary rounded-full absolute left-0 top-0"
              style={{ width: `${mission.progress}%` }}
            />
          </View>
          {/* ---(Progress Text)--- */}
          <Text className="text-small text-primary font-regular mt-1 text-right">
            {mission.progress}%
          </Text>
        </View>

        {/* ---(Treasure Chest Icon)--- */}
        <TouchableOpacity>
          <Image
            source={mission.completed ? missionCompleted : missionIncomplete}
            className="w-12 h-12 -top-4"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* ---(Mission Details)--- */}
      <View className=" flex-row justify-between items-center">
        <Text className="text-small text-primary font-regular">
          {mission.current}/{mission.target} {mission.unit}
        </Text>
        {mission.completed && (
          <Text className="text-small text-success font-regular">✓ สำเร็จ</Text>
        )}
        {!mission.completed && (
          <Text className="text-small text-alert font-regular">
            ✗ ยังไม่สำเร็จ
          </Text>
        )}
      </View>
    </View>
  );
};

export default MissionStatus;
