import { useQuery } from "@tanstack/react-query";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request";
import { CreditTransaction } from "@/types/credits";

export function useTransactions(limit: number = 10) {
  return useQuery({
    queryKey: ["transactions", limit],
    queryFn: async (): Promise<CreditTransaction[]> => {
      const data = await makeAuthenticatedJsonRequest<{
        transactions: CreditTransaction[];
      }>(`/api/user/credit-history?limit=${limit}`);
      return data.transactions || [];
    },
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  });
}
