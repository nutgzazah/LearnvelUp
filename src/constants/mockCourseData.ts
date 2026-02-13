export interface MockCourse {
  id: number;
  teacher_id: number;
  title: string;
  description: string;
  category_id: number;
  level_id: number;
  status_id: number;
  thumbnail: any; // require image
  teacherAvatar: any; // require image
  price_coin: number;
  progress?: number;
  created_at: string;
  updated_at: string;
}

export const mockCourseData: MockCourse[] = [
  {
    id: 1,
    teacher_id: 101,
    title: "Python: เริ่มต้นเขียนโปรแกรม",
    description: "เรียนรู้พื้นฐาน Python ตั้งแต่ศูนย์ เหมาะสำหรับผู้เริ่มต้น",
    category_id: 1, // Programming
    level_id: 1, // Beginner
    status_id: 1, // Published
    thumbnail: require("../../assets/images/mock/mock-course-1.png"),
    teacherAvatar: require("../../assets/images/mock/mock-avatar-1.png"),
    progress: 40,
    price_coin: 150,
    created_at: "2025-01-01",
    updated_at: "2025-01-10",
  },
  {
    id: 2,
    teacher_id: 102,
    title: "เรขาคณิต: โลกของรูปทรง",
    description: "เข้าใจโลกของรูปทรงตั้งแต่พื้นฐาน",
    category_id: 2, // Math
    level_id: 2, // Intermediate
    status_id: 1,
    thumbnail: require("../../assets/images/mock/mock-course-2.png"),
    teacherAvatar: require("../../assets/images/mock/mock-avatar-2.png"),
    progress: 80,
    price_coin: 190,
    created_at: "2025-01-05",
    updated_at: "2025-01-12",
  },
  {
    id: 3,
    teacher_id: 103,
    title:
      "เขียน Python ให้โปรใน 1 วัน ฉบับคนไม่เคย เขียนโค้ดมาก่อน (Zero to Hero)",
    description: "เรียนรู้ Python พื้นฐาน",
    category_id: 2, // Math
    level_id: 1,
    status_id: 1,
    thumbnail: require("../../assets/images/mock/mock-course-3.png"),
    teacherAvatar: require("../../assets/images/mock/mock-avatar-3.png"),
    progress: 100,
    price_coin: 180,
    created_at: "2025-01-04",
    updated_at: "2025-01-15",
  },
  {
    id: 4,
    teacher_id: 103,
    title: "สร้างเว็บแรกด้วย HTML & CSS ฉบับจับมือทำ",
    description:
      "เรียนรู้ Web Development ตั้งแต่เริ่มต้น จนถึงสามารถมีเว็บเป็นของตนเอง",
    category_id: 1,
    level_id: 2,
    status_id: 1,
    thumbnail: require("../../assets/images/mock/mock-course-4.png"),
    teacherAvatar: require("../../assets/images/mock/mock-avatar-3.png"),
    progress: 0,
    price_coin: 200,
    created_at: "2025-01-08",
    updated_at: "2025-01-15",
  },
];
