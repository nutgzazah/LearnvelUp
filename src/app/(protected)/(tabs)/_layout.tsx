import AppHeader from "@/src/components/AppHeader";
import { CustomTabBar } from "@/src/components/CustomTabBar";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";

export default function TabLayout() {
  const icons = {
    home: {
      normal: require("../../../../assets/images/nav/home-icon.png"),
      bold: require("../../../../assets/images/nav/home-icon-bold.png"),
    },
    search: {
      normal: require("../../../../assets/images/nav/search-icon.png"),
      bold: require("../../../../assets/images/nav/search-icon-bold.png"),
    },
    learn: {
      normal: require("../../../../assets/images/nav/learn-icon.png"),
      bold: require("../../../../assets/images/nav/learn-icon-bold.png"),
    },
    mission: {
      normal: require("../../../../assets/images/nav/mission-icon.png"),
      bold: require("../../../../assets/images/nav/mission-icon-bold.png"),
    },
    profile: {
      normal: require("../../../../assets/images/nav/profile-icon.png"),
      bold: require("../../../../assets/images/nav/profile-icon-bold.png"),
    },
  };

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
                source={focused ? icons.home.bold : icons.home.normal}
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
                source={focused ? icons.search.bold : icons.search.normal}
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
                source={focused ? icons.learn.bold : icons.learn.normal}
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
                source={focused ? icons.mission.bold : icons.mission.normal}
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
                source={focused ? icons.profile.bold : icons.profile.normal}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
