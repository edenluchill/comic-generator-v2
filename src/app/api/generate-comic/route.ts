import { NextRequest } from "next/server";
import { ComicGenerationRequest } from "@/types/diary";
import { comicGenerationService } from "@/lib/services/comic-generation.service";
import { StreamGenerationHelper } from "@/lib/helpers/stream-generation.helpers";
import { authenticateRequired } from "@/lib/helpers/auth-extensions.helpers";
import {
  createAuthErrorResponse,
  createValidationErrorResponse,
  handleApiError,
} from "@/lib/helpers/api-response.helpers";
import {
  validateRequestBody,
  validateRequiredFields,
  validateArrayField,
} from "@/lib/helpers/request-validation.helpers";
import { posterGenerationService } from "@/lib/services/poster-generation.service";

const COMIC_GENERATION_STEPS = [
  { name: "checking", message: "正在检查用户余额...", weight: 10 },
  { name: "analyzing", message: "正在验证角色信息...", weight: 15 },
  { name: "creating", message: "正在创建漫画...", weight: 60 },
  { name: "finalizing", message: "正在完成处理...", weight: 15 },
];

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { user, error: authError } = await authenticateRequired(request);
    if (authError || !user) {
      return createAuthErrorResponse(authError ?? undefined);
    }

    // 请求体验证
    const {
      isValid: bodyValid,
      data: body,
      errors: bodyErrors,
    } = await validateRequestBody<ComicGenerationRequest>(request);

    if (!bodyValid) {
      return createValidationErrorResponse(bodyErrors.join(", "));
    }

    // 字段验证
    const { isValid: fieldsValid, errors: fieldErrors } =
      validateRequiredFields(body!, ["diary_content", "characters"]);

    if (!fieldsValid) {
      return createValidationErrorResponse(fieldErrors.join(", "));
    }

    // 角色数组验证
    const { isValid: charactersValid, errors: charactersErrors } =
      validateArrayField(body!.characters, "characters");

    if (!charactersValid) {
      return createValidationErrorResponse(charactersErrors.join(", "));
    }

    // 提取参数，移除layout_mode传递给后端
    const {
      diary_content,
      characters,
      style = "cute",
      format = "four", // 只需要format参数
    } = body!;

    // 验证format参数
    if (format && !["single", "four"].includes(format)) {
      return createValidationErrorResponse("无效的漫画格式");
    }

    // 创建流式响应
    return StreamGenerationHelper.createStreamResponse(
      COMIC_GENERATION_STEPS,
      async (helper) => {
        let result;

        if (format === "single") {
          // 使用海报生成服务
          result = await posterGenerationService.generateSingleScene({
            userId: user.id,
            diaryContent: diary_content,
            characters,
            style,
            controller: helper["controller"],
            encoder: helper["encoder"],
          });

          helper.sendComplete(result, "海报生成完成！");
        } else {
          // 使用原来的漫画生成服务，不传layout_mode
          result = await comicGenerationService.generateComic({
            userId: user.id,
            diaryContent: diary_content,
            characters,
            style,
            format,
            controller: helper["controller"],
            encoder: helper["encoder"],
          });

          helper.sendComplete(result, "漫画生成完成！");
        }
      }
    );
  } catch (error) {
    console.error("启动漫画生成时出错:", error);
    return handleApiError(error);
  }
}
