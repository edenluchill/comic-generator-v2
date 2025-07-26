import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { CreditTransaction } from "@/types/credits";

export function useTransactions(limit: number = 10) {
  return useQuery({
    queryKey: ["transactions", limit],
    queryFn: async (): Promise<CreditTransaction[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/user/credit-history?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("获取交易记录失败");

      const data = await response.json();
      return data.transactions || [];
    },
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  });
}
