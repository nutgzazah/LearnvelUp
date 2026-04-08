export interface Reply {
  id: number;
  user: string;
  avatarColor: string;
  text: string;
  date: string;
}

export interface Comment {
  id: number;
  user: string;
  avatarColor: string;
  text: string;
  date: string;
  replies: Reply[];
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  locked: boolean;
  quizIdAfter?: number; // ดูจบแล้วไป quiz นี้
  comments: Comment[];
}

export const mockLessons: Lesson[] = [
  {
    id: 1,
    courseId: 3,
    title: "ตอนที่ 1 ทำไมต้อง Python? (เริ่มจากศูนย์)",
    duration: "02:10",
    locked: false,
    quizIdAfter: 1,
    comments: [
      {
        id: 1,
        user: "JaTingJA",
        avatarColor: "#7C5CBF",
        text: "ผมสงสัยจากตัวอย่างแรกครับว่าสามารถปรับสีของกล่องได้ไหมครับ",
        date: "25 พ.ย. 2568",
        replies: [
          {
            id: 2,
            user: "DevMastery",
            avatarColor: "#4F46E5",
            text: "สามารถเปลี่ยนได้เลยครับ",
            date: "27 พ.ย. 2568",
          },
        ],
      },
      {
        id: 3,
        user: "Hutnaikung2546",
        avatarColor: "#059669",
        text: "กดเปิด Python ไม่ได้รับขึ้นชื่อ ว่า Python is not recognized as an internal or external command",
        date: "30 พ.ย. 2568",
        replies: [],
      },
      {
        id: 4,
        user: "MindSetter99",
        avatarColor: "#DC2626",
        text: "เข้าใจมากขึ้นเลยครับ อธิบายได้ดีมากๆ",
        date: "1 ธ.ค. 2568",
        replies: [],
      },
    ],
  },
  {
    id: 2,
    courseId: 3,
    title: "ตอนที่ 2 ติดตั้ง VS Code แบบจับมือทำ",
    duration: "02:43",
    locked: true,
    comments: [],
  },
  {
    id: 3,
    courseId: 3,
    title: "ตอนที่ 3 ตัวแปร (Variable) คืออะไร?",
    duration: "02:57",
    locked: true,
    comments: [],
  },
  {
    id: 4,
    courseId: 3,
    title: "ตอนที่ 4 สั่งคอมฯ ให้ตัดสินใจด้วย If-Else",
    duration: "02:20",
    locked: true,
    comments: [],
  },
  {
    id: 5,
    courseId: 3,
    title: "ตอนที่ 5 สั่งคอมฯ ให้วนลูปด้วย While",
    duration: "02:42",
    locked: true,
    comments: [],
  },
];
