import mock_achieve1 from "../../assets/images/mock/mock-avatar-achive-1.png";
import mock_achieve2 from "../../assets/images/mock/mock-avatar-achive-2.png";

export const mockAchievement = {
  id: 1,
  name: "พ่อมด 200 ไอคิว",
  image: { mock_achieve1 },
  is_claimed: true,
  progress: 100,
  is_completed: true,
};

// Array of mock achievements
export const mockAchievements = [
  {
    id: 1,
    name: "พ่อมด 200 ไอคิว",
    image: { mock_achieve1 },
    is_claimed: true,
    progress: 100,
    is_completed: true,
  },
  {
    id: 2,
    name: "นากมั่นเพียร",
    image: { mock_achieve2 },
    is_claimed: false,
    progress: 100,
    is_completed: true,
  },
  {
    id: 3,
    name: "นินจาฝึกหัด",
    image: { mock_achieve1 },
    is_claimed: false,
    progress: 30,
    is_completed: false,
  },
  {
    id: 4,
    name: "พลธนูเฉียบคม",
    image: { mock_achieve2 },
    is_claimed: false,
    progress: 0,
    is_completed: false,
  },
];
