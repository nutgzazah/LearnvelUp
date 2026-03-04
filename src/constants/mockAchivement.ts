import mock_achieve1 from "../../assets/images/mock/mock-avatar-achive-1.png";
import mock_achieve2 from "../../assets/images/mock/mock-avatar-achive-2.png";

export const mockAchievement = {
  id: 1,
  name: "พ่อมด 200 ไอคิว",
  image: { mock_achieve1 },
  detail: "ทำคะแนนได้ 200 คะแนน",
  is_claimed: true,
  progress: 100,
  is_completed: true,
  is_used: true,
};

// Array of mock achievements
export const mockAchievements = [
  {
    id: 1,
    name: "พ่อมด 200 ไอคิว",
    detail: "ทำคะแนนได้ 200 คะแนน",
    image: { mock_achieve1 },
    is_claimed: true,
    progress: 100,
    is_completed: true,
    is_used: true,
  },
  {
    id: 2,
    name: "นากมั่นเพียร",
    detail: "เข้าเรียนติดต่อกัน 7 วัน",
    image: { mock_achieve2 },
    is_claimed: true,
    progress: 100,
    is_completed: true,
    is_used: false,
  },
  {
    id: 3,
    name: "นินจาฝึกหัด",
    detail: "ตอบคำถามถูกทั้งหมดใน 1 คอร์ส",
    image: { mock_achieve1 },
    is_claimed: false,
    progress: 100,
    is_completed: true,
    is_used: false,
  },
  {
    id: 4,
    name: "พลธนูเฉียบคม",
    detail: "เรียนครบ 100 คอร์ส",
    image: { mock_achieve2 },
    is_claimed: false,
    progress: 30,
    is_completed: false,
    is_used: false,
  },
];
