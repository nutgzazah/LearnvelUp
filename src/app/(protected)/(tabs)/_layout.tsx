import { CustomTabBar } from "@/src/components/CustomTabBar";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function TabLayout() {
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

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าหลัก",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              className="w-7 h-7"
              source={focused ? homeBoldIcon : homeIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "ค้นหา",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Image
              className="w-7 h-7"
              source={focused ? searchBoldIcon : searchIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "เรียนรู้",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Image
              className="w-7 h-7"
              source={focused ? learnBoldIcon : learnIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: "ภารกิจ",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Image
              className="w-7 h-7"
              source={focused ? missionBoldIcon : missionIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "โปรไฟล์",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <Image
              className="w-7 h-7"
              source={focused ? profileBoldIcon : profileIcon}
            />
          ),
        }}
      />
    </Tabs>
  );
}
