import { AppIcons } from "@/src/constants/icons";
import {
  equipAvatarItem,
  equipBackgroundItem,
  fetchEquippedAvatarId,
  fetchEquippedBackgroundId,
  fetchOwnedItemIds,
  fetchProfileItems,
  purchaseProfileItem,
  type ItemRecord,
} from "@/src/services/itemService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ButtonState = {
  label: string;
  variant: "used" | "equip" | "buy" | "locked" | "loading";
};

type ProfileItem = {
  id: number;
  image_url: string | null;
  title: string;
  coin?: number;
  is_bought: boolean;
  is_used: boolean;
};

const getButtonState = (
  item: ProfileItem,
  submittingItemId: number | null,
): ButtonState => {
  if (submittingItemId === item.id) {
    return { label: "กำลังดำเนินการ...", variant: "loading" };
  }

  if (item.is_used && item.is_bought) {
    return { label: "สวมใส่แล้ว", variant: "used" };
  }

  if (item.is_bought && !item.is_used) {
    return { label: "สวมใส่", variant: "equip" };
  }

  if (!item.is_bought && item.coin !== undefined) {
    return { label: "ซื้อ", variant: "buy" };
  }

  return { label: "ล็อก", variant: "locked" };
};

const btnClass: Record<ButtonState["variant"], string> = {
  used:
    "w-full py-2.5 rounded-full items-center bg-foreground border-2 border-primary",
  equip: "w-full py-2.5 rounded-full items-center bg-primary",
  buy: "w-full py-2.5 rounded-full items-center bg-[#4F4A78]",
  locked: "w-full py-2.5 rounded-full items-center bg-disablebg",
  loading: "w-full py-2.5 rounded-full items-center bg-disablebg",
};

const btnTextClass: Record<ButtonState["variant"], string> = {
  used: "text-primary text-tiny font-bold",
  equip: "text-white text-tiny font-bold",
  buy: "text-white text-tiny font-bold",
  locked: "text-white text-tiny font-bold",
  loading: "text-white text-tiny font-bold",
};

const mapItemToProfileItem = (item: ItemRecord): ProfileItem => {
  return {
    id: item.id,
    image_url: item.image_url,
    title: item.name,
    coin: item.price_coins,
    is_bought: false,
    is_used: false,
  };
};

const EditProfileScreen = () => {
  const [tab, setTab] = useState<"profile" | "bg">("profile");
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);

        const [
          { avatars, backgrounds },
          ownedItemIds,
          equippedAvatarId,
          equippedBackgroundId,
        ] = await Promise.all([
          fetchProfileItems(),
          fetchOwnedItemIds(),
          fetchEquippedAvatarId(),
          fetchEquippedBackgroundId(),
        ]);

        const ownedSet = new Set(ownedItemIds);

        const mappedProfiles = avatars.map((item) => ({
          id: item.id,
          image_url: item.image_url,
          title: item.name,
          coin: item.price_coins,
          is_bought: ownedSet.has(item.id),
          is_used: Number(equippedAvatarId) === Number(item.id),
        }));

        const mappedBackgrounds = backgrounds.map((item) => ({
          id: item.id,
          image_url: item.image_url,
          title: item.name,
          coin: item.price_coins,
          is_bought: ownedSet.has(item.id),
          is_used: Number(equippedBackgroundId) === Number(item.id),
        }));

        setProfiles(mappedProfiles);
        setBackgrounds(mappedBackgrounds);
      } catch (error) {
        console.error("loadItems error:", error);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดรายการไอเท็มได้");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const currentProfile = profiles.find((p) => p.is_used) ?? profiles[0];
  const currentBg = backgrounds.find((b) => b.is_used) ?? backgrounds[0];

  const equipProfile = (id: number) => {
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        is_used: p.id === id,
      })),
    );
  };

  const equipBackground = (id: number) => {
    setBackgrounds((prev) =>
      prev.map((b) => ({
        ...b,
        is_used: b.id === id,
      })),
    );
  };

  const markBoughtAndEquip = (itemId: number, currentTab: "profile" | "bg") => {
    if (currentTab === "profile") {
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          is_bought: p.id === itemId ? true : p.is_bought,
          is_used: p.id === itemId,
        })),
      );
      return;
    }

    setBackgrounds((prev) =>
      prev.map((b) => ({
        ...b,
        is_bought: b.id === itemId ? true : b.is_bought,
        is_used: b.id === itemId,
      })),
    );
  };

  const handleItemAction = (item: ProfileItem) => {
  if (submittingItemId !== null) return;
  if (item.is_used) return;

  if (item.is_bought) {
    Alert.alert(
      "ยืนยันการสวมใส่",
      `ต้องการสวมใส่ ${item.title} ใช่หรือไม่?`,
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ตกลง",
          onPress: async () => {
            try {
              setSubmittingItemId(item.id);

              if (tab === "profile") {
                const result = await equipAvatarItem(item.id);

                if (!result.success) {
                  Alert.alert("ไม่สำเร็จ", result.message);
                  return;
                }

                equipProfile(item.id);
                Alert.alert("สำเร็จ", result.message);
                return;
              }

              const result = await equipBackgroundItem(item.id);

              if (!result.success) {
                Alert.alert("ไม่สำเร็จ", result.message);
                return;
              }

              equipBackground(item.id);
              Alert.alert("สำเร็จ", result.message);
            } catch (error) {
              console.error("handle equip error:", error);
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถสวมใส่ไอเท็มได้");
            } finally {
              setSubmittingItemId(null);
            }
          },
        },
      ],
    );
    return;
  }

  Alert.alert(
  "ยืนยันการซื้อ",
  `คุณต้องการซื้อ ${item.title} ราคา ${item.coin ?? 0} coins ใช่หรือไม่?`,
  [
    {
      text: "ยกเลิก",
      style: "cancel",
    },
    {
      text: "ตกลง",
      onPress: async () => {
        try {
          setSubmittingItemId(item.id);

          const result = await purchaseProfileItem(item.id);

          if (!result.success) {
            Alert.alert("ซื้อไม่สำเร็จ", result.message);
            return;
          }

          if (tab === "profile") {
            const equipResult = await equipAvatarItem(item.id);

            if (!equipResult.success) {
              Alert.alert(
                "ซื้อสำเร็จ แต่สวมใส่ไม่สำเร็จ",
                equipResult.message,
              );

              setProfiles((prev) =>
                prev.map((p) => ({
                  ...p,
                  is_bought: p.id === item.id ? true : p.is_bought,
                })),
              );
              return;
            }

            markBoughtAndEquip(item.id, "profile");
          } else {
            const equipResult = await equipBackgroundItem(item.id);

            if (!equipResult.success) {
              Alert.alert(
                "ซื้อสำเร็จ แต่สวมใส่ไม่สำเร็จ",
                equipResult.message,
              );

              setBackgrounds((prev) =>
                prev.map((b) => ({
                  ...b,
                  is_bought: b.id === item.id ? true : b.is_bought,
                })),
              );
              return;
            }

            markBoughtAndEquip(item.id, "bg");
          }

          Alert.alert(
            "สำเร็จ",
            result.remainingCoins !== undefined
              ? `${result.message}\nคงเหลือ ${result.remainingCoins} coins`
              : result.message,
          );
        } catch (error) {
          console.error("handleItemAction error:", error);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถซื้อสินค้าได้");
        } finally {
          setSubmittingItemId(null);
        }
      },
    },
  ],
);
};

  const items = [...(tab === "profile" ? profiles : backgrounds)].sort((a, b) => {
    if (a.is_bought === b.is_bought) return 0;
    return a.is_bought ? -1 : 1;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative mb-16">
          <View className="h-48 w-full overflow-hidden">
            {currentBg?.image_url ? (
              <Image
                source={{ uri: currentBg.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200" />
            )}
          </View>

          <View className="absolute -bottom-12 self-center">
            <View className="w-36 h-36 rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom">
              {currentProfile?.image_url ? (
                <Image
                  source={{ uri: currentProfile.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gray-200" />
              )}
            </View>
          </View>
        </View>

        <View className="mx-4 mb-4">
          <View className="flex-row bg-background rounded-full p-1 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-full items-center ${
                tab === "profile" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setTab("profile")}
            >
              <Text
                className={`text-small ${
                  tab === "profile"
                    ? "text-white font-bold"
                    : "text-disabletext font-regular"
                }`}
              >
                รูปโปรไฟล์
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-full items-center ${
                tab === "bg" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setTab("bg")}
            >
              <Text
                className={`text-small ${
                  tab === "bg"
                    ? "text-white font-bold"
                    : "text-disabletext font-regular"
                }`}
              >
                พื้นหลัง
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row flex-wrap px-3 gap-3">
          {items.map((item) => {
            const btn = getButtonState(item, submittingItemId);

            return (
              <View
                key={item.id}
                className="bg-background rounded-[20px] p-3.5 items-center gap-1.5 shadow-sm"
                style={{ width: "47%" }}
              >
                <View
                  className={`w-[110px] h-[110px] rounded-full border-[2px] overflow-hidden ${
                    item.is_used ? "border-primary" : "border-primary/20"
                  }`}
                >
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gray-200" />
                  )}
                </View>

                <Text className="text-small font-bold text-primary">
                  {item.title}
                </Text>

                <View className="items-center justify-start min-h-[52px]">
                  {item.is_bought ? (
                    <>
                      <Text className="text-tiny text-disabletext font-regular">
                        ครอบครองแล้ว
                      </Text>
                      <View className="h-[24px] mt-1" />
                    </>
                  ) : item.coin !== undefined ? (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Image
                        source={AppIcons.HEADERS.NORMAL.COIN}
                        className="w-5 h-5"
                      />
                      <Text className="text-tiny font-bold text-secondary">
                        {item.coin}
                      </Text>
                    </View>
                  ) : (
                    <View className="h-[24px] mt-1" />
                  )}
                </View>

                <TouchableOpacity
                  className={btnClass[btn.variant]}
                  onPress={() => handleItemAction(item)}
                  disabled={
                    btn.variant === "used" ||
                    btn.variant === "locked" ||
                    btn.variant === "loading"
                  }
                >
                  <Text className={btnTextClass[btn.variant]}>{btn.label}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;