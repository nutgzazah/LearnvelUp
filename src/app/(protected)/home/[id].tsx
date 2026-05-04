// import CourseCard from "@/src/components/CourseCard";
// import CourseHorizontalList from "@/src/components/CourseHorizontalList";
// import { mockCourseData } from "@/src/constants/mockCourseData";
// import { mockHorizontalCourses } from "@/src/constants/mockHorizontalCourses";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function CourseDetailScreen() {
//   const { id } = useLocalSearchParams<{ id?: string }>();
//   const router = useRouter();

//   const courseId = Number(id);
//   const course = mockHorizontalCourses.find((item) => item.id === courseId);

//   const coinIcon = require("../../../../assets/images/coin-icon.png");
//   const topCourseIcon = require("../../../../assets/images/home/top-course-icon.png");

//   if (course) {
//     return (
//       <SafeAreaView className="flex-1 bg-background">
//         <View className="px-4 pt-3">
//           <TouchableOpacity
//             onPress={() => router.back()}
//             className="w-12 h-10 justify-center"
//           >
//             <Text className="text-body text-text">{"<"} Back</Text>
//           </TouchableOpacity>
//         </View>

//         <View className="flex-1 items-center justify-center px-6">
//           <Text className="text-h6 text-text font-regular">
//             ไม่พบข้อมูลคอร์ส
//           </Text>
//           <Text className="text-body text-disabletext font-regular mt-2">
//             กรุณาลองใหม่อีกครั้ง
//           </Text>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             className="mt-6 px-6 py-3 rounded-full bg-primary"
//           >
//             <Text className="text-body text-white font-bold">
//               กลับหน้าก่อนหน้า
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <ScrollView
//       contentContainerStyle={{ paddingBottom: 50, paddingTop: 50 }}
//       showsVerticalScrollIndicator={false}
//       className="bg-background"
//     >
//       <View>
//         <View className="flex-row mt-2 items-center mb-1 px-4">
//           <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
//           <Image
//             source={topCourseIcon}
//             className="w-7 h-7 ml-2"
//             resizeMode="contain"
//           />
//         </View>

//         <ScrollView
//           horizontal
//           contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
//           showsHorizontalScrollIndicator={false}
//         >
//           {mockCourseData.map((course) => (
//             <CourseCard
//               key={course.id}
//               courseImage={course.thumbnail}
//               avatarImage={course.teacherAvatar}
//               courseName={course.title}
//               coins={course.price_coin}
//               onPress={() => console.log("Course ID:", course.id)}
//             />
//           ))}
//         </ScrollView>

//         <View className="mt-2 mb-1 px-4">
//           <Text className="text-text font-regular text-h6">คอร์สทั้งหมด</Text>
//           <CourseHorizontalList
//             courses={mockHorizontalCourses}
//             limit={5}
//             onPressItem={(course) => console.log(course.title)}
//           />
//           <TouchableOpacity>
//             <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px]">
//               <Text className="text-primary font-regular text-body">
//                 ค้นหาคอร์สเพิ่มเติม
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }
import CourseCard from "@/src/components/CourseCard";
import CourseHorizontalList from "@/src/components/CourseHorizontalList";
import { mockCourseData } from "@/src/constants/mockCourseData";
import { supabase } from "@/src/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CourseDetail = {
  id: number;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  price_coins: number | null;
  status: string | null;
  learning_outcome: string | null;
};

type RelatedCourse = {
  id: number;
  title: string;
  categories: string[];
  thumbnail: string;
  price_coin: number;
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const topCourseIcon = require("../../../../assets/images/home/top-course-icon.png");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const courseId = Number(id);

        const { data, error } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            description,
            cover_image_url,
            price_coins,
            status,
            learning_outcome
          `)
          .eq("id", courseId)
          .single();

        if (error) {
          console.error("fetchCourse error:", error);
          setCourse(null);
          return;
        }

        setCourse(data);

        const { data: relatedData, error: relatedError } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            cover_image_url,
            price_coins
          `)
          .neq("id", courseId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5);

        if (relatedError) {
          console.error("fetchRelatedCourses error:", relatedError);
          setRelatedCourses([]);
        } else {
          setRelatedCourses(
            (relatedData || []).map((item) => ({
              id: item.id,
              title: item.title,
              categories: [],
              thumbnail: item.cover_image_url || "",
              price_coin: item.price_coins ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error("fetchCourse unexpected error:", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-10 justify-center"
          >
            <Text className="text-body text-text">{"<"} Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-h6 text-text font-regular">
            ไม่พบข้อมูลคอร์ส
          </Text>
          <Text className="text-body text-disabletext font-regular mt-2">
            กรุณาลองใหม่อีกครั้ง
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 rounded-full bg-primary"
          >
            <Text className="text-body text-white font-bold">
              กลับหน้าก่อนหน้า
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
      className="bg-background"
    >
      <View className="px-4 pt-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-10 justify-center"
        >
          <Text className="text-body text-text">{"<"} Back</Text>
        </TouchableOpacity>
      </View>

      {course.cover_image_url ? (
        <Image
          source={{ uri: course.cover_image_url }}
          className="w-full h-56"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-56 bg-gray-200 items-center justify-center">
          <Text className="text-text">ไม่มีรูปปก</Text>
        </View>
      )}

      <View className="px-4 mt-4">
        <Text className="text-text font-bold text-xl">{course.title}</Text>

        <Text className="mt-2 text-text font-regular text-body">
          {course.price_coins === 0 ? "Free" : `${course.price_coins ?? 0} Coins`}
        </Text>

        <Text className="mt-4 text-text font-regular text-body">
          {course.description || "ไม่มีรายละเอียด"}
        </Text>
      </View>

      <View className="flex-row mt-6 items-center mb-1 px-4">
        <Text className="text-text font-regular text-h6">คอร์สยอดนิยม</Text>
        <Image
          source={topCourseIcon}
          className="w-7 h-7 ml-2"
          resizeMode="contain"
        />
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
        showsHorizontalScrollIndicator={false}
      >
        {mockCourseData.map((course) => (
          <CourseCard
            key={course.id}
            courseImage={course.thumbnail}
            avatarImage={course.teacherAvatar}
            courseName={course.title}
            coins={course.price_coin}
            onPress={() => console.log("Course ID:", course.id)}
          />
        ))}
      </ScrollView>

      <View className="mt-2 mb-1 px-4">
        <Text className="text-text font-regular text-h6">คอร์สทั้งหมด</Text>

        <CourseHorizontalList
          courses={relatedCourses}
          limit={5}
        />

        <TouchableOpacity>
          <View className="mt-4 bg-background items-center border-2 border-primary rounded-[15px]">
            <Text className="text-primary font-regular text-body">
              ค้นหาคอร์สเพิ่มเติม
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}