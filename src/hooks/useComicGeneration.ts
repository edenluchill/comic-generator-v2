"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  ComicGenerationProgress,
  ComicGenerationResult,
  ComicFormat,
} from "@/types/diary";

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
  content: string; // 改为content，保持与API一致
  style?: "cute" | "realistic" | "minimal" | "kawaii";
  format?: ComicFormat;
}

export interface AddPageOptions {
  content: string; // 改为content，保持与API一致
  style?: "cute" | "realistic" | "minimal" | "kawaii";
}

export function useComicGeneration() {
  const queryClient = useQueryClient();

  const [state, setState] = useState<ComicGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: "analyzing",
    message: "",
    totalScenes: 4,
  });

  const generateComic = useCallback(
    async (options: ComicGenerationOptions) => {
      // 根据格式设置场景数量
      const scenesCount = options.format === "single" ? 1 : 4;

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: 0,
        currentStep: "analyzing",
        message: "开始生成漫画...",
        result: undefined,
        error: undefined,
        totalScenes: scenesCount, // 动态设置总场景数
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
          body: JSON.stringify({
            content: options.content, // 使用content而不是diary_content
            style: options.style,
          }),
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
                      message: data.message,
                      currentStep: data.step,
                      currentScene: data.current_scene,
                      totalScenes: data.total_scenes || prev.totalScenes,
                    }));
                    break;

                  case "scene_complete":
                    setState((prev) => ({
                      ...prev,
                      progress: data.progress,
                      message: `场景 ${data.scene_number} 完成`,
                    }));
                    break;

                  case "complete":
                    setState((prev) => ({
                      ...prev,
                      isGenerating: false,
                      progress: 100,
                      message: "漫画生成完成！",
                      result: {
                        comic_id: data.data.comic_id,
                        scenes: [data.data.scene], // 将单个scene包装为数组
                        status: data.data.status,
                      },
                    }));
                    // 清除相关查询缓存
                    queryClient.invalidateQueries({ queryKey: ["comics"] });
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
    },
    [queryClient]
  );

  const addNewPage = useCallback(
    async (options: AddPageOptions) => {
      // 确保有现有的漫画结果
      if (!state.result?.comic_id) {
        throw new Error("没有找到现有的漫画，请先生成漫画");
      }

      const currentPageCount = state.result.scenes?.length || 0;
      const nextPageNumber = currentPageCount + 1;

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: 0,
        currentStep: "analyzing",
        message: `正在添加第 ${nextPageNumber} 页...`,
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

        const response = await fetch("/api/add-comic-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            comic_id: state.result.comic_id,
            page_number: nextPageNumber,
            content: options.content, // 使用content而不是diary_content
            style: options.style,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "添加页面失败");
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
                      message: data.message,
                      currentStep: data.step,
                    }));
                    break;

                  case "complete":
                    setState((prev) => ({
                      ...prev,
                      isGenerating: false,
                      progress: 100,
                      message: "漫画生成完成！",
                      result: {
                        comic_id: data.data.comic_id,
                        scenes: [data.data.scene], // 将单个scene包装为数组
                        status: data.data.status,
                      },
                    }));

                    // 清除相关查询缓存
                    queryClient.invalidateQueries({ queryKey: ["comics"] });
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
        console.error("添加新页面时出错:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "添加页面时出现未知错误",
          isGenerating: false,
        }));
        throw error;
      }
    },
    [state.result?.comic_id, state.result?.scenes, queryClient]
  );

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
    addNewPage,
    reset,
    retryScene,
  };
}
