import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme("light");
    }
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <View className="bg-card p-8 rounded-2xl w-4/5 shadow-custom items-center">
        <Text className="text-3xl font-bold text-primary mb-4">
          Theme Test 🎨
        </Text>

        <Text className="text-lg text-text mb-6 font-medium">
          Current State:
          <Text className="font-bold text-secondary">
            {colorScheme === "dark" ? " 🌙 Dark Mode" : " ☀️ Light Mode"}
          </Text>
        </Text>

        <View className="flex-row items-center gap-4 mb-6">
          <Text className="text-text text-base">Switch Theme:</Text>
          <Switch
            value={colorScheme === "dark"}
            onValueChange={toggleColorScheme}
            trackColor={{ false: "#767577", true: "#2563EB" }}
            thumbColor={colorScheme === "dark" ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          onPress={toggleColorScheme}
          className="bg-primary px-6 py-3 rounded-full active:opacity-80"
        >
          <Text className="text-white font-bold">Tap To Switch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
