import { NextRequest } from "next/server";
import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { storeFluxCharacterImages } from "@/lib/image-storage";
import { creditService } from "@/lib/services/credit.service";
import { CREDIT_COSTS } from "@/types/credits";
import { StreamGenerationHelper } from "@/lib/helpers/stream-generation.helpers";
import { authenticateOptional } from "@/lib/helpers/auth-extensions.helpers";
import {
  createSuccessResponse,
  handleApiError,
  createValidationErrorResponse,
} from "@/lib/helpers/api-response.helpers";
import {
  validateRequestBody,
  validateRequiredFields,
} from "@/lib/helpers/request-validation.helpers";
import { handleOptionsRequest } from "@/lib/helpers/cors.helpers";

interface FluxGenerationRequest extends Record<string, unknown> {
  aspectRatio?: string;
  outputFormat?: "png" | "jpeg";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  input_image: string;
  tags: string[];
}

const FLUX_GENERATION_STEPS = [
  { name: "avatar", message: "开始生成卡通头像...", weight: 35 },
  { name: "three_view", message: "开始生成3视图全身图...", weight: 35 },
  { name: "storage", message: "正在保存图片到数据库...", weight: 15 },
  { name: "credits", message: "正在处理积分...", weight: 15 },
];

async function processFluxGeneration(
  helper: StreamGenerationHelper,
  request: FluxGenerationRequest,
  userId?: string
) {
  const generator = createFluxCharacterGenerator();
  const {
    aspectRatio = "1:1",
    outputFormat = "png",
    promptUpsampling = false,
    safetyTolerance = 2,
    input_image,
    tags,
  } = request;

  // 步骤1: 生成卡通头像
  helper.startStep("avatar");
  const avatarResult = await generator.generateCartoonAvatar(
    input_image,
    tags,
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
      helper.updateProgress(progress, `生成头像中... ${progress}%`);
    }
  );

  helper.sendCustomEvent("avatar_complete", {
    data: completedAvatar,
    message: "头像生成完成！开始生成3视图...",
  });

  // 步骤2: 生成3视图
  helper.startStep("three_view");
  const threeViewResult = await generator.generateThreeViewFromAvatar(
    completedAvatar.imageUrl!,
    { outputFormat, promptUpsampling, safetyTolerance }
  );

  const completedThreeView = await generator.waitForCompletion(
    threeViewResult.id,
    threeViewResult.pollingUrl,
    (progress) => {
      helper.updateProgress(progress, `生成3视图中... ${progress}%`);
    }
  );

  // 步骤3: 存储图片
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
  };

  // 步骤4: 处理积分（仅对登录用户）
  if (userId) {
    helper.startStep("credits");

    const deductionResult = await creditService.deductCredits({
      userId,
      amount: CREDIT_COSTS.FLUX_CHARACTER_GENERATION,
      description: "生成Flux角色（头像+3视图）",
      relatedEntityType: "flux_character",
      relatedEntityId: undefined,
      metadata: {
        avatar_url: storedAvatarUrl,
        three_view_url: storedThreeViewUrl,
        input_tags: tags.join(", "), // Convert array to string
      },
    });

    if (!deductionResult.success) {
      helper.sendCustomEvent("credit_warning", {
        message: `积分扣除失败: ${deductionResult.message}`,
        remainingCredits: deductionResult.remainingCredits,
      });
    } else {
      helper.sendCustomEvent("credit_deducted", {
        message: `成功扣除 ${CREDIT_COSTS.FLUX_CHARACTER_GENERATION} 积分`,
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

    // 请求体验证
    const {
      isValid: bodyValid,
      data: body,
      errors: bodyErrors,
    } = await validateRequestBody<FluxGenerationRequest>(request);

    if (!bodyValid) {
      return createValidationErrorResponse(bodyErrors.join(", "));
    }

    const { isValid: fieldsValid, errors: fieldErrors } =
      validateRequiredFields(body!, ["input_image", "tags"]);

    if (!fieldsValid) {
      return createValidationErrorResponse(fieldErrors.join(", "));
    }

    // 创建流式响应
    return StreamGenerationHelper.createStreamResponse(
      FLUX_GENERATION_STEPS,
      async (helper) => {
        await processFluxGeneration(helper, body!, userId);
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
