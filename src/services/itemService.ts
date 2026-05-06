import { supabase } from "@/src/lib/supabase";

export type ItemType = "avatar" | "background" | "frame";

export type ItemRecord = {
  id: number;
  image_url: string | null;
  name: string;
  price_coins: number;
  type: ItemType;
};

export type PurchaseProfileItemResult = {
  success: boolean;
  message: string;
  itemId?: number;
  spentCoins?: number;
  remainingCoins?: number;
};

export const fetchItemImageUrl = async (itemId: number) => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("image_url")
      .eq("id", itemId)
      .single();

    if (error) throw error;

    return data?.image_url || null;
  } catch (error) {
    console.error("Error fetching item image:", error);
    return null;
  }
};

export const fetchItemById = async (
  itemId: number,
): Promise<ItemRecord | null> => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("id, image_url, name, price_coins, type")
      .eq("id", itemId)
      .single();

    if (error) throw error;

    return data as ItemRecord;
  } catch (error) {
    console.error("Error fetching item by id:", error);
    return null;
  }
};

export const fetchItemsByType = async (
  type: ItemType,
): Promise<ItemRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("id, image_url, name, price_coins, type")
      .eq("type", type)
      .order("id", { ascending: true });

    if (error) throw error;

    return (data as ItemRecord[]) ?? [];
  } catch (error) {
    console.error("Error fetching items by type:", error);
    return [];
  }
};

export const fetchProfileItems = async () => {
  try {
    const [avatars, backgrounds] = await Promise.all([
      fetchItemsByType("avatar"),
      fetchItemsByType("background"),
    ]);

    return {
      avatars,
      backgrounds,
    };
  } catch (error) {
    console.error("Error fetching profile items:", error);
    return {
      avatars: [],
      backgrounds: [],
    };
  }
};

export const fetchOwnedItemIds = async (): Promise<number[]> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", user.id);

    if (error) throw error;

    return (data ?? [])
      .map((row) => row.item_id)
      .filter((id): id is number => typeof id === "number");
  } catch (error) {
    console.error("Error fetching owned item ids:", error);
    return [];
  }
};

/**
 * เช็คว่า user มี item นี้อยู่แล้วไหม
 */
export const checkUserOwnsItem = async (
  userId: string,
  itemId: number,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_inventory")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking user inventory:", error);
    return false;
  }
};

/**
 * ซื้อ item ผ่าน RPC ที่ทำงานแบบ transaction เดียวใน database
 */
export const purchaseProfileItem = async (
  itemId: number,
): Promise<PurchaseProfileItemResult> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      return {
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนซื้อสินค้า",
      };
    }

    const { data, error } = await supabase.rpc("purchase_profile_item" as any, {
      p_user_id: user.id,
      p_item_id: itemId,
    });

    if (error) {
      console.error("purchaseProfileItem RPC error:", error);
      return {
        success: false,
        message: error.message || "ไม่สามารถซื้อสินค้าได้",
      };
    }

    const result = Array.isArray(data) ? data[0] : data;

    return {
      success: !!result?.success,
      message: result?.message ?? "ไม่สามารถซื้อสินค้าได้",
      itemId: result?.item_id,
      spentCoins: result?.spent_coins,
      remainingCoins: result?.remaining_coins,
    };
  } catch (error) {
    console.error("Error purchasing profile item:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดระหว่างการซื้อสินค้า",
    };
  }
};

export const equipAvatarItem = async (
  itemId: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      return {
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      };
    }

    // เช็คก่อนว่าผู้ใช้มี item นี้อยู่จริงใน inventory
    const { data: inventoryRow, error: inventoryError } = await supabase
      .from("user_inventory")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .maybeSingle();

    if (inventoryError) throw inventoryError;

    if (!inventoryRow) {
      return {
        success: false,
        message: "คุณยังไม่ได้ครอบครองไอเท็มนี้",
      };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        equipped_avatar_id: itemId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("equipAvatarItem update error:", updateError);
      return {
        success: false,
        message: updateError.message || "ไม่สามารถสวมใส่ไอเท็มได้",
      };
    }

    return {
      success: true,
      message: "สวมใส่โปรไฟล์สำเร็จ",
    };
  } catch (error) {
    console.error("equipAvatarItem error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดระหว่างสวมใส่โปรไฟล์",
    };
  }
};

export const fetchEquippedAvatarId = async (): Promise<number | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("equipped_avatar_id")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data?.equipped_avatar_id ?? null;
  } catch (error) {
    console.error("fetchEquippedAvatarId error:", error);
    return null;
  }
};

export const equipBackgroundItem = async (
  itemId: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      return {
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน",
      };
    }

    // เช็คว่า user มี item นี้ใน inventory จริง
    const { data: inventoryRow, error: inventoryError } = await supabase
      .from("user_inventory")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .maybeSingle();

    if (inventoryError) throw inventoryError;

    if (!inventoryRow) {
      return {
        success: false,
        message: "คุณยังไม่ได้ครอบครองไอเท็มนี้",
      };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        equipped_frame_id: itemId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("equipBackgroundItem update error:", updateError);
      return {
        success: false,
        message: updateError.message || "ไม่สามารถสวมใส่พื้นหลังได้",
      };
    }

    return {
      success: true,
      message: "สวมใส่พื้นหลังสำเร็จ",
    };
  } catch (error) {
    console.error("equipBackgroundItem error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดระหว่างสวมใส่พื้นหลัง",
    };
  }
};

export const fetchEquippedBackgroundId = async (): Promise<number | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("equipped_frame_id")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data?.equipped_frame_id ?? null;
  } catch (error) {
    console.error("fetchEquippedBackgroundId error:", error);
    return null;
  }
};