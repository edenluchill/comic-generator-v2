"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Comic } from "@/types/diary";

export interface ComicsResponse {
  comics: Comic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useComics(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["comics", page, limit],
    queryFn: async (): Promise<ComicsResponse> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/comics?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("获取漫画失败");

      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useComic(comicId: string) {
  return useQuery({
    queryKey: ["comic", comicId],
    queryFn: async (): Promise<Comic> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/comics/${comicId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("获取漫画失败");

      const data = await response.json();
      return data.data;
    },
    enabled: !!comicId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
