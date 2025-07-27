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

    const { diary_content, characters, style = "cute" } = body!;

    // 创建流式响应
    return StreamGenerationHelper.createStreamResponse(
      COMIC_GENERATION_STEPS,
      async (helper) => {
        const result = await comicGenerationService.generateComic({
          userId: user.id,
          diaryContent: diary_content,
          characters,
          style,
          controller: helper["controller"], // 访问私有属性，需要改进
          encoder: helper["encoder"],
        });

        helper.sendComplete(result, "漫画生成完成！");
      }
    );
  } catch (error) {
    console.error("启动漫画生成时出错:", error);
    return handleApiError(error);
  }
}
