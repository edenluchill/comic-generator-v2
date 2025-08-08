import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FluxGenerationResult, CharacterStyle } from "@/types/flux";
import { makeAuthenticatedRequest } from "@/lib/auth-request";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request";
import { CREDIT_COSTS, UserProfile } from "@/types/credits";

export interface CharacterGenerationState {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;
  status: string;
  message: string;
  avatarResult: FluxGenerationResult | null;
  threeViewResult: FluxGenerationResult | null;
  tags: string[] | null;
  error: string | null;
  processingStep:
    | "analyzing"
    | "generating-avatar"
    | "generating-three-view"
    | "storing"
    | "processing-credits"
    | null;
}

export interface CharacterGenerationOptions {
  uploadedFile: File;
  aspectRatio?: string;
  outputFormat?: "png" | "jpeg";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  // 新的风格系统选项
  style?: CharacterStyle;
  additionalPrompt?: string;
}

export function useCharacterGeneration() {
  const queryClient = useQueryClient();

  const [state, setState] = useState<CharacterGenerationState>({
    isProcessing: false,
    currentStep: 0,
    totalSteps: 5, // 更新为5步：分析、头像、3视图、存储、积分
    progress: 0,
    status: "",
    message: "",
    avatarResult: null,
    threeViewResult: null,
    tags: null,
    error: null,
    processingStep: null,
  });

  const generateCharacter = useCallback(
    async (options: CharacterGenerationOptions) => {
      const {
        uploadedFile,
        aspectRatio = "1:1",
        outputFormat = "png",
        promptUpsampling = false,
        safetyTolerance = 2,
        style = "chibi",
        additionalPrompt,
      } = options;

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        currentStep: 0,
        progress: 0,
        avatarResult: null,
        threeViewResult: null,
        tags: null,
        error: null,
        processingStep: "analyzing",
        status: "正在准备生成...",
        message: "开始处理图片...",
      }));

      try {
        // 检查用户积分
        const { profile } = (await makeAuthenticatedJsonRequest<{
          profile: UserProfile;
        }>("/api/user/profile")) as {
          profile: UserProfile;
        };

        if (profile.current_credits < CREDIT_COSTS.CHARACTER_GENERATION) {
          throw new Error(
            `积分不足，需要 ${CREDIT_COSTS.CHARACTER_GENERATION} 积分，当前只有 ${profile.current_credits} 积分`
          );
        }

        // 准备FormData
        const formData = new FormData();
        formData.append("image", uploadedFile);
        formData.append("aspectRatio", aspectRatio);
        formData.append("outputFormat", outputFormat);
        formData.append("promptUpsampling", promptUpsampling.toString());
        formData.append("safetyTolerance", safetyTolerance.toString());
        formData.append("style", style);
        if (additionalPrompt) {
          formData.append("additionalPrompt", additionalPrompt);
        }

        // 调用集成的API端点
        const response = await makeAuthenticatedRequest(
          "/api/generate-character",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`生成请求失败: ${response.statusText}`);
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
                  case "step_start":
                    let processingStep: CharacterGenerationState["processingStep"] =
                      null;
                    let currentStep = 0;

                    switch (data.step) {
                      case "analysis":
                        processingStep = "analyzing";
                        currentStep = 1;
                        break;
                      case "avatar":
                        processingStep = "generating-avatar";
                        currentStep = 2;
                        break;
                      case "three_view":
                        processingStep = "generating-three-view";
                        currentStep = 3;
                        break;
                      case "storage":
                        processingStep = "storing";
                        currentStep = 4;
                        break;
                      case "credits":
                        processingStep = "processing-credits";
                        currentStep = 5;
                        break;
                    }

                    setState((prev) => ({
                      ...prev,
                      currentStep,
                      processingStep,
                      status: data.message,
                      progress: data.progress || prev.progress,
                    }));
                    break;

                  case "progress":
                    setState((prev) => ({
                      ...prev,
                      progress: data.progress,
                      message: data.message,
                    }));
                    break;

                  case "analysis_complete":
                    setState((prev) => ({
                      ...prev,
                      tags: data.data.tags,
                      status: data.message,
                      message: `识别到 ${data.data.tags.length} 个特征标签`,
                    }));
                    break;

                  case "avatar_complete":
                    setState((prev) => ({
                      ...prev,
                      avatarResult: data.data,
                      status: data.message,
                      message: "头像生成完成！",
                    }));
                    break;

                  case "complete":
                    setState((prev) => ({
                      ...prev,
                      avatarResult: data.data.avatar,
                      threeViewResult: data.data.threeView,
                      tags: data.data.analyzedTags, // 从结果中获取分析的标签
                      currentStep: 5,
                      progress: 100,
                      status: "生成完成！",
                      message: "所有角色图片生成完成",
                      isProcessing: false,
                      processingStep: null,
                    }));

                    // 刷新用户profile和交易历史
                    queryClient.invalidateQueries({ queryKey: ["profile"] });
                    queryClient.invalidateQueries({
                      queryKey: ["transactions"],
                    });
                    break;

                  case "error":
                    throw new Error(data.error);

                  case "credit_deducted":
                    setState((prev) => ({
                      ...prev,
                      message: data.message,
                    }));

                    // 立即刷新积分信息
                    queryClient.invalidateQueries({ queryKey: ["profile"] });
                    queryClient.invalidateQueries({
                      queryKey: ["transactions"],
                    });
                    break;

                  case "credit_warning":
                    setState((prev) => ({
                      ...prev,
                      error: data.message,
                    }));
                    break;

                  default:
                    // 处理其他类型的事件
                    console.log("未处理的事件类型:", data.type, data);
                    break;
                }
              } catch (parseError) {
                console.warn("解析流式响应数据时出错:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("生成角色时出错:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "生成过程中出现未知错误",
          isProcessing: false,
          processingStep: null,
        }));
        throw error;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: 0,
      totalSteps: 5,
      progress: 0,
      status: "",
      message: "",
      avatarResult: null,
      threeViewResult: null,
      tags: null,
      error: null,
      processingStep: null,
    });
  }, []);

  return {
    ...state,
    generateCharacter,
    reset,
  };
}
