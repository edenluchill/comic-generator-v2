"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// 删除漫画的 mutation hook
export function useDeleteComic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comicId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/comics/${comicId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除漫画失败");
      }

      return response.json();
    },
    onSuccess: () => {
      // 删除成功后刷新漫画列表
      queryClient.invalidateQueries({ queryKey: ["comics"] });
    },
  });
}

export function useUpdateComic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      comicId,
      updateData,
    }: {
      comicId: string;
      updateData: {
        title?: string;
        content?: string;
        mood?: string;
        date?: string;
      };
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/comics/${comicId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新漫画失败");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const { comicId } = variables;
      const updatedComic = data.data;

      // 直接更新缓存中的漫画数据
      queryClient.setQueryData(["comics"], (oldData: ComicsResponse) => {
        if (!oldData?.comics) return oldData;

        return {
          ...oldData,
          comics: oldData.comics.map((comic: Comic) =>
            comic.id === comicId ? { ...comic, ...updatedComic } : comic
          ),
        };
      });

      // 更新单个漫画的缓存
      queryClient.setQueryData(["comic", comicId], (oldData: Comic) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updatedComic };
      });

      // 同时刷新查询以确保数据一致性
      queryClient.invalidateQueries({ queryKey: ["comics"] });
      queryClient.invalidateQueries({ queryKey: ["comic", comicId] });
    },
  });
}
