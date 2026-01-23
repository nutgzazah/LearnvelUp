import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RewardPage = () => {
  const missionRewardBanner = require("../../assets/images/mission/mission-reward-banner.png");
  const energyIcon = require("../../assets/images/energy-icon.png");
  const xpIcon = require("../../assets/images/xp-icon.png");
  const coinIcon = require("../../assets/images/coin-icon.png");
  const missionRewardIcon = require("../../assets/images/mission/mission-reward-icon.png");
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView className="flex-1 items-center bg-background">
        <View>
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

            {/* ---(Reward Description)--- */}
            <View className="flex-row justify-between mt-8 gap-1">
              {/* ---(Reward Item 1)--- */}
              <View className="flex-col rounded-xl bg-primary min-w-36">
                {/* ---(Reward Name 1)--- */}
                <Text className="text-body text-background font-bold mt-4 text-center px-8">
                  พลังงาน
                </Text>
                <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                  <Text className="text-body text-primary font-bold text-center">
                    +
                  </Text>
                  <Image source={energyIcon} className="w-8 h-8 mx-1" />
                  <Text className="text-body text-primary font-bold text-center">
                    1
                  </Text>
                </View>
              </View>

              {/* ---(Reward Item 2)--- */}
              <View className="flex-col rounded-xl bg-alert min-w-36">
                {/* ---(Reward Name 2)--- */}
                <Text className="text-body text-background font-bold mt-4 text-center px-8">
                  XP
                </Text>
                <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                  <Text className="text-body text-alert font-bold text-center">
                    +
                  </Text>
                  <Image source={xpIcon} className="w-8 h-8 mx-1" />
                  <Text className="text-body text-alert font-bold text-center">
                    10
                  </Text>
                </View>
              </View>

              {/* ---(Reward Item 3)--- */}
              <View className="flex-col rounded-xl bg-secondary min-w-36">
                {/* ---(Reward Name 3)--- */}
                <Text className="text-body text-background font-bold mt-4 text-center px-8">
                  เหรียญ
                </Text>
                <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                  <Text className="text-body text-secondary font-bold text-center">
                    +
                  </Text>
                  <Image source={coinIcon} className="w-8 h-8 mx-1" />
                  <Text className="text-body text-secondary font-bold text-center">
                    10
                  </Text>
                </View>
              </View>
            </View>

            {/* ---(Button)--- */}
            <TouchableOpacity className="mt-14 bg-primary px-6 py-3 rounded-full flex-row min-w-56 justify-center">
              <Text className="text-body text-white font-bold">รับรางวัล</Text>
              <Image
                source={missionRewardIcon}
                className="w-7 h-7 mx-2 items-center"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default RewardPage;
