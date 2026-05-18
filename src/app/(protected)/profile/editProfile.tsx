import { AppIcons } from "@/src/constants/icons";
import {
  equipAvatarItem,
  equipBackgroundItem,
  fetchEquippedAvatarId,
  fetchEquippedBackgroundId,
  fetchOwnedItemIds,
  fetchProfileItems,
  purchaseProfileItem,
} from "@/src/services/itemService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ButtonVariant = "used" | "equip" | "buy" | "free" | "locked" | "loading";

type ProfileItem = {
  id: number;
  image_url: string | null;
  title: string;
  coin?: number;
  is_bought: boolean;
  is_used: boolean;
};

const btnClass: Record<ButtonVariant, string> = {
  used: "w-full py-2.5 rounded-full items-center bg-transparent border-2 border-primary",
  equip: "w-full py-2.5 rounded-full items-center bg-primary",
  buy: "w-full py-2.5 rounded-full items-center bg-secondary/80",
  free: "w-full py-2.5 rounded-full items-center bg-primary",
  locked: "w-full py-2.5 rounded-full items-center bg-disablebg",
  loading: "w-full py-2.5 rounded-full items-center bg-disablebg",
};

const btnTextClass: Record<ButtonVariant, string> = {
  used: "text-primary text-tiny font-bold",
  equip: "text-white text-tiny font-bold",
  buy: "text-white text-tiny font-bold",
  free: "text-white text-tiny font-bold",
  locked: "text-white text-tiny font-bold",
  loading: "text-white text-tiny font-bold",
};
const LOAD_ANIM = require("../../../../assets/json/loadingOtter.json");

const EditProfileScreen = () => {
  const [tab, setTab] = useState<"profile" | "bg">("profile");
  const [filter, setFilter] = useState<"all" | "owned" | "unowned">("all");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: storeData, isLoading } = useQuery({
    queryKey: ["profileStore", user?.id],
    queryFn: async () => {
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

      const mapItem = (item: any, equippedId: number | null): ProfileItem => ({
        id: item.id,
        image_url: item.image_url ?? null,
        title: item.name ?? "ไม่มีชื่อ",
        coin: item.price_coins ?? 0,
        is_bought: ownedSet.has(item.id),
        is_used: Number(equippedId) === Number(item.id),
      });

      return {
        avatars: avatars.map((a) => mapItem(a, equippedAvatarId)),
        backgrounds: backgrounds.map((b) => mapItem(b, equippedBackgroundId)),
      };
    },
    enabled: !!user?.id,
  });

  const equipMutation = useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: number;
      type: "profile" | "bg";
    }) => {
      const result =
        type === "profile"
          ? await equipAvatarItem(id)
          : await equipBackgroundItem(id);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileStore"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err: any) => Alert.alert("ข้อผิดพลาด", err.message),
    onSettled: () => setProcessingId(null),
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const result = await purchaseProfileItem(id);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data, variables) => {
      equipMutation.mutate({ id: variables.id, type: tab });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      Alert.alert("สำเร็จ", data.message);
    },
    onError: (err: any) => Alert.alert("ซื้อไม่สำเร็จ", err.message),
    onSettled: () => {
      if (!equipMutation.isPending) setProcessingId(null);
    },
  });

  const getButtonState = (
    item: ProfileItem,
  ): { label: string; variant: ButtonVariant } => {
    if (processingId === item.id)
      return { label: "กำลังโหลด...", variant: "loading" };
    if (item.is_used && item.is_bought)
      return { label: "สวมใส่แล้ว", variant: "used" };
    if (item.is_bought && !item.is_used)
      return { label: "สวมใส่", variant: "equip" };
    if (!item.is_bought && item.coin === 0)
      return { label: "รับฟรี", variant: "free" };
    if (!item.is_bought && item.coin !== undefined)
      return { label: "ซื้อ", variant: "buy" };

    return { label: "ล็อก", variant: "locked" };
  };

  const handleItemAction = (item: ProfileItem) => {
    if (item.is_used) return;
    if (item.is_bought) {
      setProcessingId(item.id);
      equipMutation.mutate({ id: item.id, type: tab });
      return;
    }

    const actionText =
      item.coin === 0 ? "รับไอเทมนี้ฟรี" : `ซื้อในราคา ${item.coin} coins`;
    Alert.alert("ยืนยัน", `คุณต้องการ${actionText} ใช่หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ตกลง",
        onPress: () => {
          setProcessingId(item.id);
          purchaseMutation.mutate({ id: item.id });
        },
      },
    ]);
  };

  if (isLoading || !storeData) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        {/* ✨ ใช้ LottieView แทน ActivityIndicator */}
        <LottieView
          source={LOAD_ANIM}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text className="text-primary font-bold mt-4">
          กำลังเตรียมร้านค้า...
        </Text>
      </View>
    );
  }

  const currentProfile =
    storeData.avatars.find((p) => p.is_used) ?? storeData.avatars[0];
  const currentBg = storeData.backgrounds.find((b) => b.is_used);

  let displayItems: ProfileItem[] =
    tab === "profile" ? storeData.avatars : storeData.backgrounds;

  if (tab === "profile") {
    displayItems = storeData.avatars.filter((item) => {
      if (filter === "owned") return item.is_bought;
      if (filter === "unowned") return !item.is_bought;
      return true;
    });
  }

  // ✨ ระบบจัดเรียงแบบใหม่: สวมใส่ยู่ -> มีแล้ว -> ราคาถูกไปแพง
  const sortedItems = [...displayItems].sort((a, b) => {
    // 1. ตัวที่ใส่อยู่ (is_used = true) ต้องขึ้นอันดับแรกสุดเสมอ
    if (a.is_used && !b.is_used) return -1;
    if (!a.is_used && b.is_used) return 1;

    // 2. ตัวที่ซื้อ/ครอบครองแล้ว (is_bought = true) ขึ้นก่อนของที่ยังไม่ได้ซื้อ
    if (a.is_bought && !b.is_bought) return -1;
    if (!a.is_bought && b.is_bought) return 1;

    // 3. ถ้ายังไม่ได้ซื้อทั้งคู่ เรียงจากราคาถูกไปแพง (ของราคา 0 หรือของฟรี จะขึ้นก่อนอัตโนมัติ)
    if (!a.is_bought && !b.is_bought) {
      return (a.coin ?? 0) - (b.coin ?? 0);
    }
    return 0;
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Preview */}
        <View className="relative mb-16 bg-card pb-6 ">
          <View className="h-52 w-full overflow-hidden bg-background">
            {currentBg?.image_url ? (
              <Image
                source={{ uri: currentBg.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary/80" />
            )}
          </View>

          <View className="absolute -bottom-10 self-center">
            <View className="w-32 h-32 rounded-full  bg-card items-center justify-center overflow-hidden">
              {currentProfile?.image_url ? (
                <Image
                  source={{ uri: currentProfile.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-disablebg" />
              )}
            </View>
          </View>
        </View>

        {/* หมวดหมู่ Profile / Background */}
        <View className="mx-4 mb-6">
          <View className="flex-row bg-background border border-disablebg rounded-full p-1.5">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full items-center ${tab === "profile" ? "bg-primary" : "bg-transparent"}`}
              onPress={() => setTab("profile")}
            >
              <Text
                className={`text-body ${tab === "profile" ? "text-white font-bold" : "text-disabletext font-bold"}`}
              >
                รูปโปรไฟล์
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full items-center ${tab === "bg" ? "bg-primary" : "bg-transparent"}`}
              onPress={() => setTab("bg")}
            >
              <Text
                className={`text-body ${tab === "bg" ? "text-white font-bold" : "text-disabletext font-bold"}`}
              >
                พื้นหลัง
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ตัวกรอง (Filters) โชว์เฉพาะตอนอยู่แท็บรูปโปรไฟล์ */}
        {tab === "profile" && (
          <View className="mx-4 mb-6 flex-row justify-center gap-2">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "owned", label: "ครอบครองแล้ว" },
              { id: "unowned", label: "ยังไม่ครอบครอง" },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-full border ${
                  filter === f.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-transparent border-disabletext/30"
                }`}
              >
                <Text
                  className={`text-tiny font-bold ${filter === f.id ? "text-primary" : "text-disabletext"}`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === "bg" && <View className="h-4" />}

        {/* Store Grid */}
        <View className="flex-row flex-wrap px-4 justify-between">
          {sortedItems.length === 0 ? (
            <View className="w-full py-10 items-center">
              <Text className="text-disabletext font-regular text-body">
                ไม่พบไอเทมในหมวดหมู่นี้
              </Text>
            </View>
          ) : (
            sortedItems.map((item) => {
              const btn = getButtonState(item);

              return (
                <View
                  key={item.id}
                  className="bg-card rounded-2xl p-4 items-center mb-4 border border-disabletext/30"
                  style={{ width: "48%" }}
                >
                  <View
                    className={`w-[100px] h-[100px] border-2 overflow-hidden mb-3 ${
                      item.is_used ? "border-primary" : "border-disabletext/30"
                    } ${tab === "profile" ? "rounded-full" : "rounded-2xl"}`}
                  >
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-disablebg" />
                    )}
                  </View>

                  <Text
                    className="text-small font-bold text-text text-center mb-1"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <View className="items-center justify-center h-[30px] mb-3 mt-1">
                    {item.is_used ? (
                      <Text className="text-small text-primary font-bold">
                        กำลังใช้งาน
                      </Text>
                    ) : item.is_bought ? (
                      <Text className="text-small text-disabletext font-regular">
                        ครอบครองแล้ว
                      </Text>
                    ) : item.coin === 0 ? (
                      <Text className="text-small font-bold text-primary">
                        ฟรี
                      </Text>
                    ) : item.coin !== undefined ? (
                      <View className="flex-row items-center gap-1 bg-background px-2.5 py-1 rounded-full ">
                        <Image
                          source={AppIcons.HEADERS.NORMAL.COIN}
                          className="w-3.5 h-3.5"
                        />
                        <Text className="text-small font-bold text-secondary">
                          {item.coin}
                        </Text>
                      </View>
                    ) : null}
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
                    <Text className={btnTextClass[btn.variant]}>
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
