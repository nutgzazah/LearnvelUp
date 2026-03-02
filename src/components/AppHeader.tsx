import { useRouter, useSegments } from "expo-router";
import { useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { AppIcons } from "../constants/icons";

const HEADER_CONFIG = {
  index: {
    title: "หน้าหลัก",
    actions: ["fire", "coin", "energy"],
  },
  search: {
    title: "ค้นหา",
    actions: ["coin", "search"],
  },
  learn: {
    title: "เรียนรู้",
    actions: ["fire", "coin", "energy"],
  },
  mission: {
    title: "ภารกิจ",
    actions: ["coin", "energy"],
  },
  profile: {
    title: "โปรไฟล์",
    actions: ["edit"],
  },
};

export default function AppHeader() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";
  const segments = useSegments();
  const current = segments.at(-1) ?? "index";
  const [isSearchMode, setIsSearchMode] = useState(false);

  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const ICONS = {
    fire: AppIcons.HEADERS.NORMAL.STREAK,
    coin: AppIcons.HEADERS.NORMAL.COIN,
    energy: AppIcons.HEADERS.NORMAL.ENERGY,
    search: AppIcons.HEADERS.NORMAL.SEARCH[theme], // มี LIGHT/DARK
    edit: AppIcons.HEADERS.NORMAL.PROFILE_EDIT[theme], // มี LIGHT/DARK
  };

  const { title, actions } =
    HEADER_CONFIG[current as keyof typeof HEADER_CONFIG] ?? HEADER_CONFIG.index;

  const renderAction = (key: string) => {
    if (key === "fire")
      return (
        <HeaderStat key={key} icon={ICONS.fire} value="1" color="text-alert" />
      );

    if (key === "coin")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.coin}
          value="0"
          color="text-secondary"
        />
      );

    if (key === "energy")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.energy}
          value="20"
          color="text-primary"
        />
      );

    if (key === "search") {
      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.7}
          className="w-7 h-7 mx-2 p-1 items-center justify-center"
          onPress={() => setIsSearchMode(true)}
        >
          <Image source={ICONS.search} className="w-5 h-5" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.7}
        className="
        w-7 h-7 mx-2 p-1
        items-center justify-center
      "
        onPress={() => {
          console.log(`${key} pressed`);
        }}
      >
        <Image
          source={ICONS[key as keyof typeof ICONS]}
          className="w-5 h-5"
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-background pt-8 px-6 h-28 border-b-disablebg border-b-2 dark:border-b-black">
      {!isSearchMode ? (
        /* ---( Normal Header )--- */
        <View className="flex-row items-center justify-between h-full">
          <Text className="text-h6 font-regular text-text">{title}</Text>
          <View className="flex-row items-center">
            {actions.map(renderAction)}
          </View>
        </View>
      ) : (
        /* ---( Search Mode )--- */
        <View className="flex-row items-center h-full">
          <TextInput
            autoFocus
            placeholder="ค้นหา..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              router.replace({
                pathname: "/search",
                params: { q: text },
              });
            }}
            className="
              mt-2
              flex-1
              h-10
              px-4
              rounded-full
              bg-white
              text-black
              text-small
              font-regular
              border-primary
              border-2"
            onBlur={() => setIsSearchMode(false)}
          />

          <TouchableOpacity
            className="ml-3"
            onPress={() => {
              setIsSearchMode(false);
              setSearchText("");
              router.replace("/search");
            }}
          >
            <Text className="text-body text-primary font-regular">ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* --- Small Components --- */

function HeaderStat({
  icon,
  value,
  color,
}: {
  icon: any;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center px-1">
      <Image source={icon} className="w-5 h-5 mx-1" />
      <Text className={`text-small font-bold ${color}`}>{value}</Text>
    </View>
  );
}
