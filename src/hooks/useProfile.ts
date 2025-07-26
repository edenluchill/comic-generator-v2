import { useQuery } from "@tanstack/react-query";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request";
import { UserProfile } from "@/types/credits";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const data = await makeAuthenticatedJsonRequest<{
        profile: UserProfile;
      }>("/api/user/profile");
      return data.profile;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}
