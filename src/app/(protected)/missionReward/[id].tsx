import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import RewardPage from "../../../components/RewardPage";

const MissionRewardScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <RewardPage />
    </SafeAreaView>
  );
};

export default MissionRewardScreen;
