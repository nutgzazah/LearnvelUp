import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcons } from "../constants/icons";

const RewardPage = () => {
  const params = useLocalSearchParams<{
    missionId: string;
    missionName?: string;
    energy?: string;
    xp?: string;
    coins?: string;
    navigationType?: string;
    returnPath?: string;
  }>();

  const router = useRouter();
  const [claimed, setClaimed] = useState(false);

  const missionRewardBanner = require("../../assets/images/mission/mission-reward-banner.png");
  // Parse rewards from params
  const rewards = {
    energy: params.energy ? parseInt(params.energy) : 0,
    xp: params.xp ? parseInt(params.xp) : 0,
    coins: params.coins ? parseInt(params.coins) : 0,
  };

  // Handle claim reward
  const handleClaimReward = () => {
    if (claimed) return;

    setClaimed(true);

    // Show success alert
    Alert.alert(
      "สำเร็จ!",
      `คุณได้รับ ${rewards.energy} พลังงาน, ${rewards.xp} XP และ ${rewards.coins} เหรียญ`,
      [
        {
          text: "ตกลง",
          onPress: navigateBack,
        },
      ],
    );

    // TODO: เชื่อม Backend เรียก API ที่นี่
    // await missionService.claimReward(parseInt(params.missionId));
  };

  const navigateBack = () => {
    if (params.navigationType === "replace") {
      router.replace((params.returnPath || "/(tabs)/mission") as any);
    } else {
      router.back();
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView className="flex-1 items-center bg-background">
        <View>
          {/* ---(Reward Banner)---- */}
          <Image
            source={missionRewardBanner}
            className="w-60 h-72 mt-16 mx-auto"
            resizeMode="cover"
          />

          {/* ---(Reward Content)--- */}
          <View className="items-center mt-6 mx-auto px-2">
            <Text className="text-h2 text-primary font-regular">
              ยินดีด้วย!
            </Text>
            <Text className="text-h5 text-text font-regular">
              คุณได้รับรางวัลสุดพิเศษแล้ว!
            </Text>

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
