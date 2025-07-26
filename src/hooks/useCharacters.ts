// hooks/useCharacters.ts
import { Character, CreateCharacterData } from "@/types/characters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request";

export function useCharacters() {
  return useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const data = await makeAuthenticatedJsonRequest<{
        characters: Character[];
      }>("/api/characters");
      return data.characters;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterData: CreateCharacterData) => {
      return await makeAuthenticatedJsonRequest<{
        character: Character;
      }>("/api/characters", {
        method: "POST",
        body: JSON.stringify(characterData),
      });
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
      return await makeAuthenticatedJsonRequest(
        `/api/characters/${characterId}`,
        {
          method: "DELETE",
        }
      );
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
      return await makeAuthenticatedJsonRequest<{
        character: Character;
      }>(`/api/characters/${characterId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
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
