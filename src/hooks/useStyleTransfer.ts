import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface StyleTransferRequest {
  baseImage: File;
  styleReference: File;
  prompt?: string;
}

export interface StyleTransferResult {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

export interface StyleTransferProgress {
  step: string;
  progress: number;
  message: string;
}

export function useStyleTransfer() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState<StyleTransferProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const transferStyle = async (request: StyleTransferRequest): Promise<StyleTransferResult> => {
    setIsTransferring(true);
    setError(null);
    setProgress(null);

    try {
      const formData = new FormData();
      formData.append("baseImage", request.baseImage);
      formData.append("styleReference", request.styleReference);
      if (request.prompt) {
        formData.append("prompt", request.prompt);
      }

      const response = await fetch("/api/style-transfer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "风格转换失败");
      }

      // Handle simple JSON response
      const result = await response.json();
      
      if (!result.data) {
        throw new Error("风格转换未返回结果");
      }

      setProgress({
        step: "complete",
        progress: 100,
        message: "风格转换完成！",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "风格转换失败";
      setError(errorMessage);
      throw err;
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transferStyle,
    isTransferring,
    progress,
    error,
  };
}
