export interface StreamProgressData {
  type: "progress";
  step: string;
  message: string;
  progress: number;
  current_scene?: number;
  total_scenes?: number;
}

export interface StreamCompleteData {
  type: "complete";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

export interface StreamErrorData {
  type: "error";
  error: string;
}

export type StreamData =
  | StreamProgressData
  | StreamCompleteData
  | StreamErrorData;

export class StreamUtils {
  /**
   * 创建流式响应编码器
   */
  static createEncoder(): TextEncoder {
    return new TextEncoder();
  }

  /**
   * 编码并发送进度数据
   */
  static encodeProgress(
    encoder: TextEncoder,
    controller: ReadableStreamDefaultController,
    data: Omit<StreamProgressData, "type">
  ): void {
    const progressData: StreamProgressData = {
      type: "progress",
      ...data,
    };

    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
    );
  }

  /**
   * 编码并发送完成数据
   */
  static encodeComplete(
    encoder: TextEncoder,
    controller: ReadableStreamDefaultController,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    message: string
  ): void {
    const completeData: StreamCompleteData = {
      type: "complete",
      data,
      message,
    };

    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`)
    );
  }

  /**
   * 编码并发送错误数据
   */
  static encodeError(
    encoder: TextEncoder,
    controller: ReadableStreamDefaultController,
    error: string
  ): void {
    const errorData: StreamErrorData = {
      type: "error",
      error,
    };

    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
    );
  }

  /**
   * 创建流式响应头部
   */
  static createStreamHeaders(): Record<string, string> {
    return {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }

  /**
   * 创建进度回调函数
   */
  static createProgressCallback(
    encoder: TextEncoder,
    controller: ReadableStreamDefaultController,
    baseProgress: number,
    progressWeight: number,
    currentScene: number,
    totalScenes: number
  ): (progress: number) => void {
    return (progress: number) => {
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_images",
        current_scene: currentScene,
        total_scenes: totalScenes,
        message: `正在生成第${currentScene}个场景... ${progress}%`,
        progress: baseProgress + progress * progressWeight,
      });
    };
  }
}
