import mockProfileImg1 from "../../assets/images/mock/mock-profile-avatar-1.png";
import mockProfileImg2 from "../../assets/images/mock/mock-profile-avatar-2.png";
import mockProfileImg3 from "../../assets/images/mock/mock-profile-avatar-3.png";
import mockProfileImg4 from "../../assets/images/mock/mock-profile-avatar-4.png";
import mockBgImg1 from "../../assets/images/mock/mock-profile-bg-1.png";
import mockBgImg2 from "../../assets/images/mock/mock-profile-bg-2.png";

export type mockProfilePic = {
  id: number;
  image: any;
  is_used: boolean;
  is_bought: boolean;
  title: string;
  coin?: number;
};

export const mockProfileImg: mockProfilePic[] = [
  {
    id: 1,
    image: mockProfileImg1,
    is_used: true,
    is_bought: true,
    title: "นากกล้าหาญ",
  },
  {
    id: 2,
    image: mockProfileImg2,
    is_used: false,
    is_bought: true,
    title: "นากนักบวช",
    coin: 30,
  },
  {
    id: 3,
    image: mockProfileImg3,
    is_used: false,
    is_bought: false,
    title: "นากพลธนู",
    coin: 200,
  },
  {
    id: 4,
    image: mockProfileImg4,
    is_used: false,
    is_bought: false,
    title: "นากอัศวิน",
    coin: 300,
  },
];

export const mockProfileBg: mockProfilePic[] = [
  {
    id: 1,
    image: mockBgImg1,
    is_used: true,
    is_bought: true,
    title: "ท้องฟ้า",
  },
  {
    id: 2,
    image: mockBgImg2,
    is_used: false,
    is_bought: true,
    title: "ป่าของนาก",
  },
];
