import { Stack } from 'expo-router';
// 👇 สำคัญมาก! ต้อง Import ไฟล์นี้เพื่อให้ Tailwind ทำงาน
import "../../global.css";

export default function RootLayout() {
  return (
    <Stack>
      {/* บอกให้ Stack โหลดหน้า (tabs) มาแสดง และซ่อนหัวข้อข้างบน */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}