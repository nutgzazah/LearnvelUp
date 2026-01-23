import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const RewardPage = () => {
  const router = useRouter();
  return (
    <View>
      <Text>RewardPage</Text>
      <Text onPress={() => router.back()}>Go Back</Text>
    </View>
  );
};

export default RewardPage;
