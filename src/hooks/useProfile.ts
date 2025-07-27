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
    staleTime: 2 * 60 * 1000, // 缩短到2分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
    refetchOnWindowFocus: false, // 防止切换窗口时重复请求
    retry: 1, // 只重试1次，减少失败时的等待时间
    refetchOnMount: false, // 如果数据还新鲜，不重新请求
  });
}
