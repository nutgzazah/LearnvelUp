import { create } from "zustand";

export type PopupType = "streak" | "levelup";

interface PopupStore {
  queue: PopupType[];
  // ฟังก์ชันเพิ่มคิว
  addPopup: (popup: PopupType) => void;
  // ฟังก์ชันดึงคิวแรกสุดออกมา (พร้อมลบออกจากคิว)
  popNext: () => PopupType | null;
  // ฟังก์ชันล้างคิวทั้งหมด (เผื่อกรณี error หรือกดยกเลิกกลางคัน)
  clearQueue: () => void;
}

export const usePopupStore = create<PopupStore>((set, get) => ({
  queue: [],

  addPopup: (popup) =>
    set((state) => {
      // เช็คก่อนว่ามีคิวนี้อยู่แล้วหรือยัง จะได้ไม่เด้งเบิ้ล
      if (!state.queue.includes(popup)) {
        return { queue: [...state.queue, popup] };
      }
      return state;
    }),

  popNext: () => {
    const currentQueue = get().queue;
    if (currentQueue.length === 0) return null;

    // เอาตัวแรกสุดออกมา
    const nextPopup = currentQueue[0];
    // ตัดตัวแรกทิ้ง อัปเดตคิวใหม่
    set({ queue: currentQueue.slice(1) });

    return nextPopup;
  },

  clearQueue: () => set({ queue: [] }),
}));
