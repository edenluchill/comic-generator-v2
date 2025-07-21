"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Diary } from "@/types/diary";

export interface DiaryWithComics extends Diary {
  comics: Array<DiaryComic>;
}

export interface DiaryComic {
  id: string;
  title?: string;
  style: string;
  status: string;
  created_at: string;
  updated_at?: string;
  comic_scene: Array<SimpleComicScene>;
}

export interface SimpleComicScene {
  id: string;
  scene_order: number;
  image_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiariesResponse {
  diaries: DiaryWithComics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useDiaries(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["diaries", page, limit],
    queryFn: async (): Promise<DiariesResponse> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/diaries?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("获取日记失败");

      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

export function useDiary(diaryId: string) {
  return useQuery({
    queryKey: ["diary", diaryId],
    queryFn: async (): Promise<DiaryWithComics> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/diaries/${diaryId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("获取日记失败");

      const data = await response.json();
      return data.data;
    },
    enabled: !!diaryId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 新增：删除日记的 mutation hook
export function useDeleteDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diaryId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/diaries/${diaryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除日记失败");
      }

      return response.json();
    },
    onSuccess: () => {
      // 删除成功后刷新日记列表
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
    },
  });
}

export function useUpdateDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      diaryId,
      updateData,
    }: {
      diaryId: string;
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

      const response = await fetch(`/api/diaries/${diaryId}`, {
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
        throw new Error(errorData.error || "更新日记失败");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const { diaryId } = variables;
      const updatedDiary = data.data;

      // 直接更新缓存中的日记数据
      queryClient.setQueryData(["diaries"], (oldData: DiariesResponse) => {
        if (!oldData?.diaries) return oldData;

        return {
          ...oldData,
          diaries: oldData.diaries.map((diary: DiaryWithComics) =>
            diary.id === diaryId ? { ...diary, ...updatedDiary } : diary
          ),
        };
      });

      // 更新单个日记的缓存
      queryClient.setQueryData(
        ["diary", diaryId],
        (oldData: DiaryWithComics) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updatedDiary };
        }
      );

      // 同时刷新查询以确保数据一致性
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
      queryClient.invalidateQueries({ queryKey: ["diary", diaryId] });
    },
  });
}
