import { NextRequest } from "next/server";
import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { storeFluxCharacterImages } from "@/lib/image-storage";
import { creditService } from "@/lib/services/credit.service";
import { faceAnalysisService } from "@/lib/services/face-analysis.service";
import { CREDIT_COSTS } from "@/types/credits";
import { StreamGenerationHelper } from "@/lib/helpers/stream-generation.helpers";
import { authenticateOptional } from "@/lib/helpers/auth-extensions.helpers";
import {
  createSuccessResponse,
  handleApiError,
  createValidationErrorResponse,
} from "@/lib/helpers/api-response.helpers";
import { handleOptionsRequest } from "@/lib/helpers/cors.helpers";
import { CharacterStyle, ViewType } from "@/types/flux";

interface FluxGenerationRequest extends Record<string, unknown> {
  aspectRatio?: string;
  outputFormat?: "png" | "jpeg";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  input_image?: string; // 可选，用于向后兼容
  tags?: string[]; // 可选，用于向后兼容
  // 新的风格系统参数
  style?: string; // 风格选择
  additionalPrompt?: string; // 额外提示词
}

const FLUX_GENERATION_STEPS = [
  { name: "analysis", message: "正在分析图片特征...", weight: 15 },
  { name: "avatar", message: "开始生成卡通头像...", weight: 30 },
  { name: "three_view", message: "开始生成3视图全身图...", weight: 30 },
  { name: "storage", message: "正在保存图片到数据库...", weight: 15 },
  { name: "credits", message: "正在处理积分...", weight: 10 },
];

async function processFluxGeneration(
  helper: StreamGenerationHelper,
  imageFile: File | null,
  request: FluxGenerationRequest,
  userId?: string
) {
  const generator = createFluxCharacterGenerator();
  const {
    aspectRatio = "1:1",
    outputFormat = "png",
    promptUpsampling = false,
    safetyTolerance = 2,
    style = "chibi", // 默认使用chibi风格
    additionalPrompt,
  } = request;

  let input_image: string;
  let tags: string[];

  // 步骤1: 分析图片特征（如果提供了图片）
  if (imageFile) {
    helper.startStep("analysis");

    try {
      // 分析面部特征
      tags = await faceAnalysisService.analyzeFace(imageFile);

      // 将图片转换为base64用于后续生成
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      input_image = `data:${imageFile.type};base64,${buffer.toString(
        "base64"
      )}`;

      helper.sendCustomEvent("analysis_complete", {
        data: { tags },
        message: `图片分析完成！识别到 ${tags.length} 个特征标签`,
      });
    } catch (error) {
      throw new Error(
        `图片分析失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  } else {
    // 使用传入的参数（向后兼容）
    if (!request.input_image || !request.tags) {
      throw new Error("缺少必要的图片或标签参数");
    }
    input_image = request.input_image;
    tags = request.tags;
  }

  // 步骤2: 生成头像
  helper.startStep("avatar");

  const avatarResult = await generator.generateCharacter(
    {
      image: input_image,
      style: style as CharacterStyle,
      viewType: "avatar" as ViewType,
      tags,
      additionalPrompt,
    },
    {
      aspectRatio,
      outputFormat,
      promptUpsampling,
      safetyTolerance,
    }
  );

  const completedAvatar = await generator.waitForCompletion(
    avatarResult.id,
    avatarResult.pollingUrl,
    (progress) => {
      helper.updateProgress(progress, `生成${style}风格头像中... ${progress}%`);
    }
  );

  helper.sendCustomEvent("avatar_complete", {
    data: completedAvatar,
    message: `${style}风格头像生成完成！开始生成三视图...`,
  });

  // 步骤3: 生成三视图
  helper.startStep("three_view");
  const threeViewResult = await generator.generateCharacter(
    {
      image: completedAvatar.imageUrl!,
      style: style as CharacterStyle,
      viewType: "three-view",
      tags,
      additionalPrompt,
    },
    {
      outputFormat,
      promptUpsampling,
      safetyTolerance,
      aspectRatio: "4:3", // 三视图使用更宽的比例
    }
  );

  const completedThreeView = await generator.waitForCompletion(
    threeViewResult.id,
    threeViewResult.pollingUrl,
    (progress) => {
      helper.updateProgress(
        progress,
        `生成${style}风格三视图中... ${progress}%`
      );
    }
  );

  // 步骤4: 存储图片
  helper.startStep("storage");
  const { storedAvatarUrl, storedThreeViewUrl } =
    await storeFluxCharacterImages(
      completedAvatar.imageUrl!,
      completedThreeView.imageUrl!,
      userId
    );

  const finalResults = {
    avatar: { ...completedAvatar, imageUrl: storedAvatarUrl },
    threeView: { ...completedThreeView, imageUrl: storedThreeViewUrl },
    analyzedTags: tags, // 包含分析得到的标签
    style, // 包含使用的风格
  };

  // 步骤5: 处理积分（仅对登录用户）
  if (userId) {
    helper.startStep("credits");

    const deductionResult = await creditService.deductCredits({
      userId,
      amount: CREDIT_COSTS.CHARACTER_GENERATION,
      description: "生成Flux角色（头像+3视图）",
      relatedEntityType: "flux_character",
      relatedEntityId: undefined,
      metadata: {
        avatar_url: storedAvatarUrl,
        three_view_url: storedThreeViewUrl,
        input_tags: tags.join(", "),
      },
    });

    if (!deductionResult.success) {
      helper.sendCustomEvent("credit_warning", {
        message: `积分扣除失败: ${deductionResult.message}`,
        remainingCredits: deductionResult.remainingCredits,
      });
    } else {
      helper.sendCustomEvent("credit_deducted", {
        message: `成功扣除 ${CREDIT_COSTS.CHARACTER_GENERATION} 积分`,
        remainingCredits: deductionResult.remainingCredits,
      });
    }
  }

  const successMessage = userId
    ? "所有生成完成！图片已保存到数据库，积分已扣除。"
    : "所有生成完成！图片已保存到数据库。";

  helper.sendComplete(finalResults, successMessage);
}

export async function POST(request: NextRequest) {
  try {
    // 可选认证（支持匿名用户）
    const { userId } = await authenticateOptional(request);

    // 检查Content-Type来决定如何处理请求
    const contentType = request.headers.get("content-type") || "";

    let imageFile: File | null = null;
    let requestData: FluxGenerationRequest = {};

    if (contentType.includes("multipart/form-data")) {
      // 处理FormData（新的图片上传方式）
      const formData = await request.formData();
      imageFile = formData.get("image") as File;

      if (!imageFile) {
        return createValidationErrorResponse("未上传图片");
      }

      // 获取其他参数
      const aspectRatio = formData.get("aspectRatio") as string;
      const outputFormat = formData.get("outputFormat") as "png" | "jpeg";
      const promptUpsampling = formData.get("promptUpsampling") === "true";
      const safetyTolerance =
        parseInt(formData.get("safetyTolerance") as string) || 2;
      const style = (formData.get("style") as string) || "chibi";
      const additionalPrompt = formData.get("additionalPrompt") as string;

      requestData = {
        aspectRatio,
        outputFormat,
        promptUpsampling,
        safetyTolerance,
        style,
        additionalPrompt,
      };
    } else {
      // 处理JSON（向后兼容）
      try {
        requestData = await request.json();
        if (!requestData.input_image || !requestData.tags) {
          return createValidationErrorResponse(
            "缺少必要的参数: input_image 和 tags"
          );
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return createValidationErrorResponse(error.message);
        }
        return createValidationErrorResponse("请求体格式错误");
      }
    }

    // 创建流式响应
    return StreamGenerationHelper.createStreamResponse(
      FLUX_GENERATION_STEPS,
      async (helper) => {
        await processFluxGeneration(helper, imageFile, requestData, userId);
      }
    );
  } catch (error) {
    console.error("启动Flux角色生成时出错:", error);
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const pollingUrl = searchParams.get("pollingUrl");

    if (!taskId) {
      return createValidationErrorResponse("缺少任务ID");
    }

    const generator = createFluxCharacterGenerator();
    const result = await generator.getGenerationStatus(
      taskId,
      pollingUrl || undefined
    );

    return createSuccessResponse(result, "状态查询成功");
  } catch (error) {
    console.error("查询Flux生成状态时出错:", error);
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return handleOptionsRequest();
}
