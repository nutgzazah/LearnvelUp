import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "../services/userService";
import { useAuthStore } from "../stores/useAuthStore";

export const useUserStats = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: () => fetchUserStats(user?.id as string),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};
