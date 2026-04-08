import AppHeader from "@/src/components/AppHeader";
import { CustomTabBar } from "@/src/components/CustomTabBar";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { AppIcons } from "@/src/constants/icons";
import { Image, View } from "react-native";

export default function TabLayout() {
  // Check Authentication
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);

  // If profile is not complete, redirect to onboarding
  if (!isProfileComplete) {
    return <Redirect href="/(protected)/onboarding" />;
  }

  const homeIcon = require("../../../../assets/images/nav/home-icon.png");
  const homeBoldIcon = require("../../../../assets/images/nav/home-icon-bold.png");
  const searchIcon = require("../../../../assets/images/nav/search-icon.png");
  const searchBoldIcon = require("../../../../assets/images/nav/search-icon-bold.png");
  const learnIcon = require("../../../../assets/images/nav/learn-icon.png");
  const learnBoldIcon = require("../../../../assets/images/nav/learn-icon-bold.png");
  const missionIcon = require("../../../../assets/images/nav/mission-icon.png");
  const missionBoldIcon = require("../../../../assets/images/nav/mission-icon-bold.png");
  const profileIcon = require("../../../../assets/images/nav/profile-icon.png");
  const profileBoldIcon = require("../../../../assets/images/nav/profile-icon-bold.png");


export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Custom Header */}
      <AppHeader />

      {/* Custom TabBar */}
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "หน้าหลัก",
            tabBarIcon: ({ focused }) => (
              <Image
                className="w-7 h-7"
                source={
                  focused ? AppIcons.TABS.BOLD.HOME : AppIcons.TABS.NORMAL.HOME
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "ค้นหา",
            tabBarIcon: ({ focused }) => (
              <Image
                className="w-7 h-7"
                source={
                  focused
                    ? AppIcons.TABS.BOLD.SEARCH
                    : AppIcons.TABS.NORMAL.SEARCH
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "เรียนรู้",
            tabBarIcon: ({ focused }) => (
              <Image
                className="w-7 h-7"
                source={
                  focused
                    ? AppIcons.TABS.BOLD.LEARN
                    : AppIcons.TABS.NORMAL.LEARN
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mission"
          options={{
            title: "ภารกิจ",
            tabBarIcon: ({ focused }) => (
              <Image
                className="w-7 h-7"
                source={
                  focused
                    ? AppIcons.TABS.BOLD.MISSION
                    : AppIcons.TABS.NORMAL.MISSION
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "โปรไฟล์",
            tabBarIcon: ({ focused }) => (
              <Image
                className="w-7 h-7"
                source={
                  focused
                    ? AppIcons.TABS.BOLD.PROFILE
                    : AppIcons.TABS.NORMAL.PROFILE
                }
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
