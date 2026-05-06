import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
// ✨ 1. อย่าลืม Import TouchableOpacity เข้ามาด้วยนะครับ
import { Animated, Text, TouchableOpacity } from "react-native";
import loadingOtter from "../../assets/json/loadingOtter.json";

const TIPS = [
  "รู้หรือไม่? เรียนวันละ 15 นาทีช่วยให้จำได้ดีกว่าเรียนรวดเดียว 2 ชั่วโมงนะ!",
  "ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น!",
  "สะสมแต้มทุกวันเพื่อปลดล็อกไอเทมสุดเท่ในร้านค้า!",
  "อย่าลืมพักสายตาบ้างนะ นากน้อยเป็นห่วง!",
  "พร้อมจะเปิดโลกใหม่ๆ หรือยัง? ลุยกันเลย!",
];

interface LoadingScreenProps {
  text?: string;
  visible?: boolean;
  // ✨ 2. เพิ่ม prop ให้หน้านี้รับฟังก์ชันเวลายกเลิกได้
  onCancel?: () => void;
}

export default function LoadingScreen({
  text = "LOADING...",
  visible = true,
  onCancel, // ✨ รับค่า onCancel มา
}: LoadingScreenProps) {
  const [randomTip, setRandomTip] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isRendered, setIsRendered] = useState(visible);

  // ✨ 3. เพิ่ม State คุมการโชว์ปุ่มยกเลิก
  const [showCancelBtn, setShowCancelBtn] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      fadeAnim.setValue(1);
      setShowCancelBtn(false); // ซ่อนปุ่มไว้ก่อนทุกครั้งที่เริ่มโหลดใหม่

      const randomIndex = Math.floor(Math.random() * TIPS.length);
      setRandomTip(TIPS[randomIndex]);

      // ✨ 4. ตั้งเวลาจับเวลา 10 วินาที
      const timer = setTimeout(() => {
        setShowCancelBtn(true); // พอครบ 10 วิ ค่อยโชว์ปุ่ม
      }, 10000);

      // อย่าลืมล้างเวลาทิ้งถ้าโหลดเสร็จก่อน 10 วิ
      return () => clearTimeout(timer);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, fadeAnim]);

  if (!isRendered) return null;

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="absolute inset-0 z-50 bg-background justify-center items-center px-8"
    >
      <LottieView
        source={loadingOtter}
        autoPlay
        loop
        style={{ width: 250, height: 250 }}
      />

      {text && (
        <Text className="text-disabletext mt-4 font-bold text-body tracking-[4px] uppercase">
          {text}
        </Text>
      )}

      <Text className="text-text font-regular text-body text-center mt-5 leading-relaxed">
        {randomTip}
      </Text>

      {/* ✨ 5. ปุ่มยกเลิก จะเรนเดอร์ก็ต่อเมื่อ showCancelBtn เป็น true */}
      {showCancelBtn && onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          className="mt-8 px-8 py-3 bg-disablebg/20 rounded-full border border-disablebg/30"
        >
          <Text className="text-white font-bold text-body">ย้อนกลับ</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
