"use client";

import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { store } from "./index";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 创建 QueryClient 实例（使用 useState 确保在客户端渲染时保持稳定）
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认查询配置
            staleTime: 5 * 60 * 1000, // 5分钟
            gcTime: 10 * 60 * 1000, // 10分钟
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            // 默认 mutation 配置
            retry: 1,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
