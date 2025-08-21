"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface ExpandedStoryData {
  expandedStory: string;
  environment: string;
  mood: string;
  additionalDetails: string;
}

export interface StoryExpansionState {
  isExpanding: boolean;
  expandedData?: ExpandedStoryData;
  error?: string;
}

export interface StoryExpansionOptions {
  story: string;
  characters: Array<{ id: string; name: string; avatar_url: string }>;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
  format?: "single" | "three" | "four";
  panelCount?: number;
}

export function useStoryExpansion() {
  const queryClient = useQueryClient();

  const [state, setState] = useState<StoryExpansionState>({
    isExpanding: false,
  });

  const expandStory = useCallback(
    async (options: StoryExpansionOptions) => {
      setState((prev) => ({
        ...prev,
        isExpanding: true,
        error: undefined,
        expandedData: undefined,
      }));

      try {
        // 获取用户会话
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("用户未登录");
        }

        const response = await fetch("/api/expand-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          let errorMessage = "故事扩展请求失败";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // 如果不是JSON响应，获取文本内容
            const errorText = await response.text();
            errorMessage = `服务器错误 (${response.status}): ${errorText.substring(0, 100)}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            expandedData: result.data,
            isExpanding: false,
          }));

          // 刷新用户profile和交易历史，确保credit余额及时更新
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({
            queryKey: ["transactions"],
          });

          return result.data;
        } else {
          throw new Error("故事扩展失败");
        }
      } catch (error) {
        console.error("扩展故事时出错:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "扩展过程中出现未知错误",
          isExpanding: false,
        }));
        throw error;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setState({
      isExpanding: false,
    });
  }, []);

  return {
    ...state,
    expandStory,
    reset,
  };
}
