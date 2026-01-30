import { View } from "react-native";
import CourseCard from "./CourseCard";

export interface CourseCardItem {
  id: number;
  courseImage: any;
  avatarImage: any;
  courseName: string;
  coins: number;
}

interface CourseCardListProps {
  courses: CourseCardItem[];
  limit?: number; // Limit
  onPressItem?: (course: CourseCardItem) => void;
}

export default function CourseCardList({
  courses,
  limit,
  onPressItem,
}: CourseCardListProps) {
  const displayCourses = limit ? courses.slice(0, limit) : courses;

  return (
    <View className="flex-row">
      {displayCourses.map((course) => (
        <CourseCard
          key={course.id}
          courseImage={course.courseImage}
          avatarImage={course.avatarImage}
          courseName={course.courseName}
          coins={course.coins}
          onPress={() => onPressItem?.(course)}
        />
      ))}
    </View>
  );
}
