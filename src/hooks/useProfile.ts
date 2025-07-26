import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/credits";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("获取用户档案失败");

      const data = await response.json();
      return data.profile;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}
