import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcons } from "../constants/icons";

// SearchParams for Mission (useLocalSearchParams — String)
type RewardSearchParams = {
  missionId: string;
  missionName?: string;
  energy?: string;
  xp?: string;
  coins?: string;
  navigationType?: string;
  returnPath?: string;
};

// OverrideParams
export type AchievementOverrideParams = {
  missionId: string;
  rewardType: "achievement";
  achievementName: string;
  achievementImage: ImageSourcePropType;
  energy?: string;
  xp?: string;
  coins?: string;
  navigationType?: string;
  returnPath?: string;
};

type RewardPageProps = {
  overrideParams?: AchievementOverrideParams;
};

const RewardPage = ({ overrideParams }: RewardPageProps) => {
  const searchParams = useLocalSearchParams<RewardSearchParams>();
  const router = useRouter();

  // แยก flow ตาม overrideParams
  const isAchievement = !!overrideParams;
  const sharedParams = overrideParams ?? searchParams;
  const [claimed, setClaimed] = useState(false);

  const missionRewardBanner = require("../../assets/images/mission/mission-reward-banner.png");
  // Parse rewards from params
  const rewards = {
    energy: sharedParams.energy ? parseInt(sharedParams.energy) : 0,
    xp: sharedParams.xp ? parseInt(sharedParams.xp) : 0,
    coins: sharedParams.coins ? parseInt(sharedParams.coins) : 0,
  };

  // Handle claim reward
  const handleClaimReward = () => {
    if (claimed) return;

    setClaimed(true);

    // Success alert
    if (isAchievement) {
      // Achievement
      Alert.alert(
        "สำเร็จ!",
        `คุณได้รับ "${overrideParams?.achievementName}" แล้ว!`,
        [{ text: "ตกลง", onPress: navigateBack }],
      );
    } else {
      // Mission
      Alert.alert(
        "สำเร็จ!",
        `คุณได้รับ ${rewards.energy} พลังงาน, ${rewards.xp} XP และ ${rewards.coins} เหรียญ`,
        [{ text: "ตกลง", onPress: navigateBack }],
      );
    }

    // await missionService.claimReward(parseInt(params.missionId));
  };

  const navigateBack = () => {
    if (isAchievement) {
      router.dismissTo("/(tabs)/profile" as any);
    } else if (sharedParams.navigationType === "replace") {
      router.replace((sharedParams.returnPath || "/(tabs)/mission") as any);
    } else {
      router.back();
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView className="flex-1 items-center bg-background">
        <View>
          {/* ---(Reward Banner)---- */}
          {isAchievement && overrideParams?.achievementImage ? (
            // Achievement: mock local image
            <View className="mt-24 mx-auto items-center">
              <Image
                source={overrideParams.achievementImage}
                className="w-60 h-60"
                resizeMode="contain"
              />
            </View>
          ) : (
            // Mission banner
            <Image
              source={missionRewardBanner}
              className="w-60 h-72 mt-16 mx-auto"
              resizeMode="cover"
            />
          )}

          {/* ---(Reward Content)--- */}
          <View className="items-center mt-6 mx-auto px-2">
            <Text className="text-h2 text-primary font-regular">
              ยินดีด้วย!
            </Text>
            {isAchievement ? (
              // Achievement
              <>
                <Text className="text-h5 text-text font-bold mt-8 text-center">
                  {overrideParams?.achievementName || " "}
                </Text>
                <Text className="text-body text-text font-regular mt-4">
                  คุณได้รับเหรียญตราแล้ว!
                </Text>
              </>
            ) : (
              // Mission
              <Text className="text-h5 text-text font-regular">
                คุณได้รับรางวัลสุดพิเศษแล้ว!
              </Text>
            )}

            {/* ---(Mission Name (Optional))--- */}
            {/* {params.missionName && (
              <Text className="text-body text-gray-500 font-regular mt-2">
                {params.missionName}
              </Text>
            )} */}

            {/* ---(Reward Cards)--- */}
            <View className="flex-row justify-between mx-auto mt-8 px-1 gap-1">
              {/* Energy Reward */}
              {rewards.energy > 0 && (
                <View className="flex-col rounded-xl bg-primary min-w-36">
                  <Text className="text-body text-background font-bold mt-4 text-center px-8">
                    พลังงาน
                  </Text>
                  <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                    <Text className="text-body text-primary font-bold text-center">
                      +
                    </Text>
                    <Image
                      source={AppIcons.HEADERS.NORMAL.ENERGY}
                      className="w-8 h-8 mx-1"
                    />
                    <Text className="text-body text-primary font-bold text-center">
                      {rewards.energy}
                    </Text>
                  </View>
                </View>
              )}

              {/* ---(XP Reward)--- */}
              {rewards.xp > 0 && (
                <View className="flex-col rounded-xl bg-alert min-w-36">
                  <Text className="text-body text-background font-bold mt-4 text-center px-8">
                    XP
                  </Text>
                  <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                    <Text className="text-body text-alert font-bold text-center">
                      +
                    </Text>
                    <Image
                      source={AppIcons.HEADERS.NORMAL.XP}
                      className="w-8 h-8 mx-1"
                    />
                    <Text className="text-body text-alert font-bold text-center">
                      {rewards.xp}
                    </Text>
                  </View>
                </View>
              )}

              {/* ---(Coins Reward)--- */}
              {rewards.coins > 0 && (
                <View className="flex-col rounded-xl bg-secondary min-w-36">
                  <Text className="text-body text-background font-bold mt-4 text-center px-8">
                    เหรียญ
                  </Text>
                  <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                    <Text className="text-body text-secondary font-bold text-center">
                      +
                    </Text>
                    <Image
                      source={AppIcons.HEADERS.NORMAL.COIN}
                      className="w-8 h-8 mx-1"
                    />
                    <Text className="text-body text-secondary font-bold text-center">
                      {rewards.coins}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ---(Claim Button)--- */}
            <TouchableOpacity
              onPress={handleClaimReward}
              disabled={claimed}
              className={`mt-16 mb-auto px-6 py-3 rounded-full flex-row min-w-56 justify-center ${
                claimed ? "bg-disabletext" : "bg-primary"
              }`}
            >
              <Text className="text-body text-white font-bold">
                {claimed ? "รับรางวัลแล้ว" : "รับรางวัล"}
              </Text>
              {!claimed && (
                <Image
                  source={AppIcons.MISSION.NORMAL.REWARD}
                  className="w-7 h-7 mx-2 items-center color-background"
                />
              )}
            </TouchableOpacity>

            {/* Info Text */}
            {claimed && (
              <Text className="text-tiny font-regular text-disabletext mt-4">
                กำลังนำคุณกลับหน้าเดิม...
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default RewardPage;
