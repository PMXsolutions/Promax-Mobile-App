import { profileService } from "@/services/profile";
import { CompanyDetail, StaffProfile } from "@/types/auth";
import { StaffAvailability } from "@/types/users";
import { useQuery } from "@tanstack/react-query";

const useFetchStaffProfile = (staffId: number) => {
  return useQuery<StaffProfile>({
    queryKey: ["staff", { id: staffId }],
    queryFn: () => profileService.fetchStaffProfile(staffId),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    enabled: !!staffId, // Only run the query if staffId is defined
  });
};

const useFetchCompanyData = (companyId: number) => {
  return useQuery<CompanyDetail>({
    queryKey: ["company", companyId],
    queryFn: () => profileService.fetchCompanyData(companyId),
    refetchOnWindowFocus: false,
    enabled: !!companyId, // Only run the query if companyId is defined
  });
};
const useFetchAvailability = (staffId: number) => {
  return useQuery<StaffAvailability[]>({
    queryKey: ["availability", staffId],
    queryFn: () => profileService.fetchStaffAvailability(staffId),
    enabled: !!staffId, // Only run the query if companyId is defined
  });
};
export const profileQuery = {
  useFetchStaffProfile,
  useFetchCompanyData,
  useFetchAvailability,
};
