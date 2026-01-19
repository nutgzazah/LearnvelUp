import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="designSystem"
        options={{ title: "Design System", headerShown: true }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "โปรไฟล์", headerShown: true }}
      />
    </Tabs>
  );
}
