import { StreamUtils } from "@/lib/services/stream-utils";

export interface StreamStep {
  name: string;
  message: string;
  weight: number; // 权重，用于计算总进度
}

export interface StreamGenerationConfig {
  steps: StreamStep[];
  onProgress?: (step: string, progress: number, message: string) => void;
  onError?: (error: string) => void;
  onComplete?: (data: unknown, message: string) => void;
}

export class StreamGenerationHelper {
  private encoder: TextEncoder;
  private controller: ReadableStreamDefaultController;
  private steps: StreamStep[];
  private currentStepIndex: number = 0;
  private totalWeight: number;

  constructor(
    controller: ReadableStreamDefaultController,
    config: StreamGenerationConfig
  ) {
    this.encoder = StreamUtils.createEncoder();
    this.controller = controller;
    this.steps = config.steps;
    this.totalWeight = config.steps.reduce((sum, step) => sum + step.weight, 0);
  }

  /**
   * 开始新的步骤
   */
  startStep(stepName: string, customMessage?: string): void {
    const step = this.steps.find((s) => s.name === stepName);
    if (!step) {
      throw new Error(`Step ${stepName} not found in configuration`);
    }

    this.currentStepIndex = this.steps.indexOf(step);
    const message = customMessage || step.message;

    StreamUtils.encodeProgress(this.encoder, this.controller, {
      step: stepName,
      message,
      progress: this.calculateProgress(0),
    });
  }

  /**
   * 更新当前步骤的进度
   */
  updateProgress(stepProgress: number, customMessage?: string): void {
    if (this.currentStepIndex >= this.steps.length) return;

    const currentStep = this.steps[this.currentStepIndex];
    const message = customMessage || currentStep.message;

    StreamUtils.encodeProgress(this.encoder, this.controller, {
      step: currentStep.name,
      message,
      progress: this.calculateProgress(stepProgress),
    });
  }

  /**
   * 发送错误信息
   */
  sendError(error: string | Error): void {
    const errorMessage = error instanceof Error ? error.message : error;
    StreamUtils.encodeError(this.encoder, this.controller, errorMessage);
  }

  /**
   * 发送完成信息
   */
  sendComplete(data: unknown, message: string): void {
    StreamUtils.encodeComplete(this.encoder, this.controller, data, message);
  }

  /**
   * 发送自定义消息
   */
  sendCustomEvent(type: string, data: unknown): void {
    this.controller.enqueue(
      this.encoder.encode(
        `data: ${JSON.stringify({ type, ...(data as object) })}\n\n`
      )
    );
  }

  /**
   * 计算总体进度
   */
  private calculateProgress(stepProgress: number): number {
    if (this.currentStepIndex >= this.steps.length) return 100;

    let completedWeight = 0;
    for (let i = 0; i < this.currentStepIndex; i++) {
      completedWeight += this.steps[i].weight;
    }

    const currentStepWeight = this.steps[this.currentStepIndex].weight;
    const currentStepProgress = (stepProgress / 100) * currentStepWeight;

    return Math.round(
      ((completedWeight + currentStepProgress) / this.totalWeight) * 100
    );
  }

  /**
   * 创建流式响应的快捷方法
   */
  static createStreamResponse(
    steps: StreamStep[],
    handler: (helper: StreamGenerationHelper) => Promise<void>
  ): Response {
    const stream = new ReadableStream({
      async start(controller) {
        const helper = new StreamGenerationHelper(controller, { steps });

        try {
          await handler(helper);
        } catch (error) {
          helper.sendError(
            error instanceof Error ? error.message : "Unknown error"
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: StreamUtils.createStreamHeaders(),
    });
  }
}
