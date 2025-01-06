import { profileService } from "@/services/profile";
import { StaffProfile } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

const useFetchStaffProfile = (staffId: number) => {
  return useQuery<StaffProfile>({
    queryKey: ["staff", staffId],
    queryFn: () => profileService.fetchStaffProfile(staffId),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    enabled: !!staffId, // Only run the query if staffId is defined
  });
};

export const profileQuery = {
  useFetchStaffProfile,
};
