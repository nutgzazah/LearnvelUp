import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      
      {/* ทดสอบ Text สีฟ้า + ตัวหนา + ขนาดใหญ่ */}
      <Text className="text-blue-600 text-4xl font-bold">
        Hello LearnvelUp! 🚀
      </Text>

      {/* ทดสอบ Text สีเทา + เว้นระยะห่างด้านบน (mt-4) */}
      <Text className="text-gray-500 text-lg mt-4">
        New Project Setup Complete
      </Text>
      
    </View>
  );
}