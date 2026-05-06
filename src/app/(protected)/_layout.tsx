import { AppIcons } from "@/src/constants/icons";
import { fetchUserStats } from "@/src/services/userService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

// ✨ 1. สร้าง Component ย่อยสำหรับปุ่มย้อนกลับ
const HeaderBackButton = ({
  navigation,
  theme,
}: {
  navigation: any;
  theme: string;
}) => (
  // ✨ เอา View ที่ครอบอยู่ออก แล้วย้าย padding/margin มาใส่ใน TouchableOpacity แทน
  // ✨ พร้อมเพิ่ม hitSlop เพื่อขยายพื้นที่รับสัมผัสรอบๆ รูปภาพออกไปอีกฝั่งละ 15 พิกเซล
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    className="  p-1"
    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
  >
    <Image
      source={AppIcons.HEADERS.NORMAL.BACK[theme as "LIGHT" | "DARK"]}
      className="w-7 h-7"
      resizeMode="contain"
    />
  </TouchableOpacity>
);

// ✨ 2. Component สำหรับแสดง Stat ด้านขวาบน (อัปเกรดใช้ TanStack Query!)
const HeaderStats = ({
  showCoins = false,
  showEnergy = false,
  showStreak = false,
}: {
  showCoins?: boolean;
  showEnergy?: boolean;
  showStreak?: boolean;
}) => {
  // ดึงข้อมูล User จาก Zustand ที่คุณมีอยู่
  // (สมมติว่าใน useAuthStore มีการเก็บ object user ไว้นะครับ ถ้าชื่อตัวแปรต่างไป ปรับแก้ได้เลย)
  const user = useAuthStore((state) => state.user);

  // ✨ จุดปล่อยของ! ใช้ TanStack Query ดึงข้อมูล
  const { data: stats } = useQuery({
    queryKey: ["userStats", user?.id], // กุญแจสำหรับ Cache ข้อมูลของ User คนนี้
    queryFn: () => fetchUserStats(user?.id as string),
    enabled: !!user?.id, // จะทำงานก็ต่อเมื่อมี user.id แล้วเท่านั้น
    staleTime: 1000 * 60 * 5, // ✨ ข้อมูลนี้จะถือว่าสดใหม่ 5 นาที (ไม่ต้องดึงใหม่จากฐานข้อมูลเวลาเปลี่ยนหน้าไปมา)
  });

  // ถ้าไม่ได้สั่งให้โชว์อะไรเลย ก็คืนค่า null ไปเลย
  if (!showCoins && !showEnergy && !showStreak) return null;

  return (
    <View className="flex-row items-center pr-4">
      {showStreak && (
        <View className="flex-row items-center ml-4">
          <Image
            source={AppIcons.HEADERS.NORMAL.STREAK}
            className="w-5 h-5 mr-1"
            resizeMode="contain"
          />
          <Text className="text-small font-bold text-alert">
            {stats?.streak ?? "..."}
          </Text>
        </View>
      )}

      {showCoins && (
        <View className="flex-row items-center ml-4">
          <Image
            source={AppIcons.HEADERS.NORMAL.COIN}
            className="w-5 h-5 mr-1"
            resizeMode="contain"
          />
          {/* ใช้ stats?.coins ถ้ายังโหลดไม่เสร็จจะขึ้นเป็น ... */}
          <Text className="text-small font-bold text-secondary">
            {stats?.coins ?? "..."}
          </Text>
        </View>
      )}

      {showEnergy && (
        <View className="flex-row items-center ml-4">
          <Image
            source={AppIcons.HEADERS.NORMAL.ENERGY}
            className="w-5 h-5 mr-1"
            resizeMode="contain"
          />
          <Text className="text-primary font-bold text-small">
            {stats?.energy ?? "..."}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    // ✨ 3. ย้ายของที่ซ้ำกันมาไว้ใน screenOptions
    <Stack
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <HeaderBackButton navigation={navigation} theme={theme} />
        ),
        headerTitleAlign: "left",
        headerShadowVisible: true,
        headerBackground: () => (
          <View className="bg-background absolute inset-0" />
        ),
        headerTitleStyle: {
          fontSize: 19,
          color: "rgb(var(--color-text) / <alpha-value>)",
          fontFamily: "K2D-Regular",
        },
      })}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Screens ที่ไม่มี Header */}
      <Stack.Screen
        name="missionReward/[id]"
        options={{ presentation: "card", headerShown: false }}
      />
      <Stack.Screen
        name="home/[id]"
        options={{ presentation: "card", headerShown: false }}
      />
      <Stack.Screen
        name="profile/achieveReward/[id]"
        options={{ presentation: "card", headerShown: false }}
      />
      <Stack.Screen
        name="course/lesson/[id]"
        options={{ headerShown: false }}
      />

      {/* ✨ 4. Screens ที่มี Header เรียกใช้ HeaderStats พร้อมเปิด Props ที่ต้องการ */}
      <Stack.Screen
        name="course/[id]"
        options={{
          title: "คอร์สเรียน",
          headerRight: () => <HeaderStats showCoins showEnergy />,
        }}
      />
      <Stack.Screen
        name="course/teacher/[id]"
        options={{
          title: "ผู้สอน",
          headerRight: () => <HeaderStats showCoins showEnergy />,
        }}
      />
      <Stack.Screen
        name="profile/wishlist"
        options={{
          title: "คอร์สที่อยากได้",
          headerRight: () => <HeaderStats showCoins />,
          headerSearchBarOptions: {
            placeholder: "ค้นหาคอร์สที่อยากได้",
            onChangeText: (text) => console.log("Search", text),
          },
        }}
      />
      <Stack.Screen
        name="profile/achieve"
        options={{
          title: "เหรียญตราความสำเร็จ",
          // ไม่ส่ง headerRight แปลว่าไม่โชว์ Stat เลย
          headerSearchBarOptions: {
            placeholder: "ค้นหาเหรียญตราความสำเร็จ",
            onChangeText: (text) => console.log("Search", text),
          },
        }}
      />
      <Stack.Screen
        name="profile/editProfile"
        options={{
          title: "แก้ไขโปรไฟล์",
          headerRight: () => <HeaderStats showCoins showStreak />,
        }}
      />

      {/* หน้า Quiz ที่เป็น Custom Header */}
      <Stack.Screen
        name="course/quiz/[id]"
        options={({ route }: any) => {
          const hpPercentage = route.params?.hpPercentage ?? 100;
          const currentEnergy = route.params?.currentEnergy ?? 20;

          return {
            title: "",
            headerTitleAlign: "center",
            headerShadowVisible: false,

            // ✨ 1. แก้หลอดเลือดให้ขนาดคงที่ และอยู่ตรงกลางจริงๆ
            headerTitle: () => (
              <View className="items-center justify-center w-[260px]">
                <View className="w-full relative h-3 bg-disablebg/30 rounded-full overflow-hidden">
                  <View
                    className="absolute left-0 top-0 bottom-0 bg-alert rounded-full"
                    style={{ width: `${hpPercentage}%` }}
                  />
                </View>
              </View>
            ),
            // ✨ 2. จัด Energy ให้ขยับมาตรงกลางขึ้นนิดนึง
            headerRight: () => (
              <View className="flex-row items-center justify-end pr-2 min-w-[50px]">
                <Image
                  source={AppIcons.HEADERS.NORMAL.ENERGY}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-primary font-bold ml-1 text-small">
                  {currentEnergy}
                </Text>
              </View>
            ),
          };
        }}
      />
    </Stack>
  );
}
