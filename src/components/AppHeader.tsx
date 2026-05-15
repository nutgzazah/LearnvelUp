import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { AppIcons } from "../constants/icons";
import { useUserStats } from "../hook/useUserStats";
import { useAuthStore } from "../stores/useAuthStore";

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
    actions: ["fire", "coin", "energy"],
  },
  profile: {
    title: "โปรไฟล์",
    actions: ["edit", "settings"],
  },
};

export default function AppHeader() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";
  const segments = useSegments();

  const lastValidSegment = useRef<string>("index");
  const currentSegment = segments.at(-1) ?? "index";

  if (HEADER_CONFIG[currentSegment as keyof typeof HEADER_CONFIG]) {
    lastValidSegment.current = currentSegment;
  }

  const current = lastValidSegment.current;

  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setSearchText(q || "");
  }, [q]);

  const { data: userStats } = useUserStats();

  useEffect(() => {
    const logLoginActivity = async () => {
      if (!user?.id) return;

      const { error } = await supabase.rpc("log_user_activity", {
        p_user_id: user.id,
        p_action_type: "login",
      });

      if (error) {
        console.log("Login Log Error:", error.message);
      }
    };

    logLoginActivity();
  }, [user?.id]);

  const isStreakActiveToday = () => {
    if (!userStats?.last_activity_date) return false;
    const lastDate = new Date(userStats.last_activity_date);
    const today = new Date();
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  };

  const isActive = isStreakActiveToday();

  const ICONS = {
    fire: isActive
      ? AppIcons.HEADERS.NORMAL.STREAK
      : AppIcons.HEADERS.NORMAL.STREAK_INACTIVE[theme],
    coin: AppIcons.HEADERS.NORMAL.COIN,
    energy: AppIcons.HEADERS.NORMAL.ENERGY,
    search: AppIcons.HEADERS.NORMAL.SEARCH[theme],
    edit: AppIcons.HEADERS.NORMAL.PROFILE_EDIT[theme],
    settings: AppIcons.HEADERS.NORMAL.SETTING[theme],
  };

  const { title, actions } =
    HEADER_CONFIG[current as keyof typeof HEADER_CONFIG] ?? HEADER_CONFIG.index;

  const renderAction = (key: string) => {
    if (key === "fire")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.fire}
          value={String(userStats?.streak ?? "...")}
          color={isActive ? "text-alert" : "text-disabletext"}
          onPress={() => router.push("/(protected)/resource/streaks" as any)}
        />
      );

    if (key === "coin")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.coin}
          value={String(userStats?.coins ?? "...")}
          color="text-secondary"
          onPress={() => router.push("/(protected)/resource/coins" as any)}
        />
      );

    if (key === "energy")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.energy}
          value={String(userStats?.energy ?? "...")}
          color="text-primary"
          onPress={() => router.push("/(protected)/resource/energy" as any)}
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
          <Image source={ICONS.search} className="w-6 h-6" />
        </TouchableOpacity>
      );
    }

    if (key === "settings") {
      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.7}
          className="w-7 h-7 ml-4 mx-1 p-1 items-center justify-center"
          onPress={() => router.push("/(protected)/profile/settings" as any)}
        >
          <Image
            source={ICONS[key as keyof typeof ICONS]}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.7}
        className="w-7 h-7 ml-2 mx-1 p-1 items-center justify-center"
        onPress={() => {
          router.push("/(protected)/profile/editProfile" as any);
        }}
      >
        <Image
          source={ICONS[key as keyof typeof ICONS]}
          className="w-6 h-6"
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-background pt-14 px-6 h-32 shadow-custom z-50">
      {!isSearchMode ? (
        <View className="flex-row items-center justify-between h-full">
          <Text className="text-h6 font-regular text-text">{title}</Text>
          <View className="h-[44px] px-3 items-center justify-center rounded-full bg-background border border-text/10">
            <View className="flex-row items-center">
              {actions.map(renderAction)}
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center h-full">
          <View className="flex-1 flex-row items-center bg-background border border-primary/80 rounded-full px-4 h-10 mt-2">
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
              className="flex-1 text-text text-small font-regular py-0"
              onBlur={() => setIsSearchMode(false)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  router.replace("/search");
                }}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="ml-3 mt-2"
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

function HeaderStat({
  icon,
  value,
  color,
  onPress,
}: {
  icon: any;
  value: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      className="flex-row items-center px-1.5"
    >
      <Image source={icon} className="w-5 h-5 mx-1" />
      <Text className={`text-small font-bold ${color}`}>{value}</Text>
    </TouchableOpacity>
  );
}
