// hooks/useCharacters.ts
import { Character, CreateCharacterData } from "@/types/characters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useCharacters() {
  return useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      // Get the current session to extract the access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("获取角色失败");
      const data = await response.json();
      return data.characters;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterData: CreateCharacterData) => {
      // Get the current session to extract the access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(characterData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("创建角色失败");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => {
      // Get the current session to extract the access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/characters/${characterId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除角色失败");
      }

      return response.json();
    },
    onSuccess: () => {
      // 刷新角色列表
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      characterId,
      updateData,
    }: {
      characterId: string;
      updateData: { name?: string; avatarUrl?: string; threeViewUrl?: string };
    }) => {
      // Get the current session to extract the access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/characters/${characterId}`, {
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
        throw new Error(errorData.error || "更新角色失败");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const { characterId } = variables;
      const updatedCharacter = data.character;

      // 直接更新缓存中的角色数据
      queryClient.setQueryData(["characters"], (oldData: Character[]) => {
        if (!oldData) return oldData;

        return oldData.map((character) =>
          character.id === characterId ? updatedCharacter : character
        );
      });

      // 同时刷新查询以确保数据一致性
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
