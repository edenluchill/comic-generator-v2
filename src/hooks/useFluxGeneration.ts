import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FluxGenerationResult } from "@/types/flux";
import { makeAuthenticatedRequest } from "@/lib/auth-request";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request";
import { CREDIT_COSTS, UserProfile } from "@/types/credits";

export interface FluxGenerationState {
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
    | null;
}

export interface FluxGenerationOptions {
  uploadedFile: File;
  uploadedImage: string;
}

export function useFluxGeneration() {
  const queryClient = useQueryClient();

  const [state, setState] = useState<FluxGenerationState>({
    isProcessing: false,
    currentStep: 0,
    totalSteps: 3,
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
    async (options: FluxGenerationOptions) => {
      const { uploadedFile, uploadedImage } = options;

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        currentStep: 0,
        progress: 0,
        avatarResult: null,
        threeViewResult: null,
        error: null,
        processingStep: "analyzing",
        status: "正在分析图片特征...",
        message: "开始分析面部特征...",
      }));

      try {
        // 第一步：分析脸部特征
        let currentTags = state.tags;

        if (!currentTags) {
          setState((prev) => ({
            ...prev,
            processingStep: "analyzing",
            status: "正在分析面部特征...",
            message: "分析中...",
            progress: 10,
          }));

          const formData = new FormData();
          formData.append("image", uploadedFile);

          const analysisResponse = await fetch("/api/analyze-face", {
            method: "POST",
            body: formData,
          });

          const analysisResponseData = await analysisResponse.json();

          if (!analysisResponseData.success) {
            throw new Error("分析失败: " + analysisResponseData.error);
          }

          currentTags = analysisResponseData.data;

          setState((prev) => ({
            ...prev,
            tags: currentTags,
            currentStep: 1,
            progress: 20,
            status: "分析完成，开始生成卡通头像...",
            message: "面部特征分析完成",
          }));
        }

        // 第二步和第三步：通过 API 路由生成角色
        setState((prev) => ({
          ...prev,
          processingStep: "generating-avatar",
          status: "正在生成卡通头像...",
          message: "启动头像生成...",
          progress: 30,
        }));

        const { profile } = (await makeAuthenticatedJsonRequest<{
          profile: UserProfile;
        }>("/api/user/profile")) as {
          profile: UserProfile;
        };

        if (profile.current_credits < CREDIT_COSTS.FLUX_CHARACTER_GENERATION) {
          throw new Error(
            `积分不足，需要 ${CREDIT_COSTS.FLUX_CHARACTER_GENERATION} 积分，当前只有 ${profile.current_credits} 积分`
          );
        }

        // 调用流式 API 端点
        const response = await makeAuthenticatedRequest(
          "/api/generate-flux-character",
          {
            method: "POST",
            body: JSON.stringify({
              aspectRatio: "1:1",
              outputFormat: "png",
              promptUpsampling: false,
              safetyTolerance: 2,
              input_image: uploadedImage,
              seed: 390804,
              tags: currentTags,
            }),
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
                  case "status":
                    setState((prev) => ({
                      ...prev,
                      status: data.message,
                      currentStep: data.step,
                      processingStep:
                        data.step === 1
                          ? "generating-avatar"
                          : "generating-three-view",
                    }));
                    break;

                  case "progress":
                    const baseProgress = data.step === 1 ? 30 : 65;
                    const stepProgress = data.step === 1 ? 0.35 : 0.35;
                    setState((prev) => ({
                      ...prev,
                      progress: baseProgress + data.progress * stepProgress,
                      status: data.message,
                      message: data.status,
                    }));
                    break;

                  case "avatar_complete":
                    setState((prev) => ({
                      ...prev,
                      avatarResult: data.data,
                      currentStep: 2,
                      progress: 65,
                      status: data.message,
                      message: "头像生成完成",
                      processingStep: "generating-three-view",
                    }));
                    break;

                  case "complete":
                    setState((prev) => ({
                      ...prev,
                      avatarResult: data.data.avatar,
                      threeViewResult: data.data.threeView,
                      currentStep: 3,
                      progress: 100,
                      status: "生成完成！",
                      message: "所有角色图片生成完成",
                      isProcessing: false,
                      processingStep: null,
                    }));
                    // 刷新用户profile和交易历史，确保credit余额及时更新
                    queryClient.invalidateQueries({ queryKey: ["profile"] });
                    queryClient.invalidateQueries({
                      queryKey: ["transactions"],
                    });
                    break;

                  case "error":
                    throw new Error(data.error);

                  case "credit_deducted":
                    // 更新UI显示积分扣除信息并立即刷新profile数据
                    setState((prev) => ({
                      ...prev,
                      message: data.message,
                    }));
                    // 立即刷新用户profile和交易历史，确保UI显示最新的credit余额
                    queryClient.invalidateQueries({ queryKey: ["profile"] });
                    queryClient.invalidateQueries({
                      queryKey: ["transactions"],
                    });
                    break;

                  case "credit_warning":
                    // 显示积分扣除警告
                    setState((prev) => ({
                      ...prev,
                      error: data.message,
                    }));
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
    [state.tags, queryClient]
  );

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: 0,
      totalSteps: 3,
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
