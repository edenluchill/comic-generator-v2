"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { ComicGenerationProgress, ComicGenerationResult } from "@/types/diary";

export interface ComicGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: ComicGenerationProgress["step"];
  message: string;
  currentScene?: number;
  totalScenes: number;
  result?: ComicGenerationResult;
  error?: string;
}

export interface ComicGenerationOptions {
  diary_content: string;
  characters: Array<{ id: string; name: string; avatar_url: string }>;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
}

export function useComicGeneration() {
  const [state, setState] = useState<ComicGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: "analyzing",
    message: "",
    totalScenes: 4,
  });

  const generateComic = useCallback(async (options: ComicGenerationOptions) => {
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      currentStep: "analyzing",
      message: "开始生成漫画...",
      result: undefined,
      error: undefined,
    }));

    try {
      // 获取用户会话
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/generate-comic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成请求失败");
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应流");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case "progress":
                  setState((prev) => ({
                    ...prev,
                    progress: data.progress,
                    currentStep: data.step,
                    message: data.message,
                    currentScene: data.current_scene,
                    totalScenes: data.total_scenes || prev.totalScenes,
                  }));
                  break;

                case "complete":
                  setState((prev) => ({
                    ...prev,
                    progress: 100,
                    currentStep: "completed",
                    message: data.message,
                    result: data.data,
                    isGenerating: false,
                  }));
                  break;

                case "error":
                  throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn("解析流式响应数据时出错:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("生成漫画时出错:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "生成过程中出现未知错误",
        isGenerating: false,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      currentStep: "analyzing",
      message: "",
      totalScenes: 4,
    });
  }, []);

  const retryScene = useCallback(
    async (sceneId: string, newDescription?: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("用户未登录");
        }

        const response = await fetch(`/api/comic-scenes/${sceneId}/retry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            new_description: newDescription,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "重试失败");
        }

        const result = await response.json();

        // 更新本地状态中的场景数据
        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            result: prev.result
              ? {
                  ...prev.result,
                  scenes: prev.result.scenes?.map((scene) =>
                    scene.id === sceneId ? { ...scene, ...result.data } : scene
                  ),
                }
              : prev.result,
          }));
        }

        return result;
      } catch (error) {
        console.error("重试场景时出错:", error);
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    generateComic,
    reset,
    retryScene,
  };
}
