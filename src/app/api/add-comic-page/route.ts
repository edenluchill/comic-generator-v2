import { NextRequest } from "next/server";
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
} from "@/lib/helpers/request-validation.helpers";
import { comicDatabaseService } from "@/lib/services/comic-database.service";

const ADD_PAGE_STEPS = [
  { name: "checking", message: "正在检查用户余额...", weight: 10 },
  { name: "validating", message: "正在验证漫画信息...", weight: 15 },
  { name: "analyzing", message: "正在分析内容...", weight: 20 },
  { name: "generating", message: "正在生成新页面...", weight: 50 },
  { name: "finalizing", message: "正在完成处理...", weight: 5 },
];

interface AddComicPageRequest extends Record<string, unknown> {
  comic_id: string;
  page_number: number;
  content: string;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
}

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
    } = await validateRequestBody<AddComicPageRequest>(request);

    if (!bodyValid) {
      return createValidationErrorResponse(bodyErrors.join(", "));
    }

    // 字段验证
    const { isValid: fieldsValid, errors: fieldErrors } =
      validateRequiredFields(body!, [
        "comic_id",
        "content", // 改为content
      ]);

    if (!fieldsValid) {
      return createValidationErrorResponse(fieldErrors.join(", "));
    }

    // 提取参数
    const { comic_id, page_number, content, style = "cute" } = body!;

    // 验证页码
    if (typeof page_number !== "number" || page_number < 1) {
      return createValidationErrorResponse("页码必须是大于0的整数");
    }

    // 创建流式响应
    return StreamGenerationHelper.createStreamResponse(
      ADD_PAGE_STEPS,
      async (helper) => {
        // 验证漫画是否存在且属于当前用户
        helper.updateProgress(10, "正在验证漫画信息...");

        const comic = await comicDatabaseService.getComicWithScenes(comic_id);
        if (!comic) {
          throw new Error("漫画不存在");
        }

        if (comic.user_id !== user.id) {
          throw new Error("无权限访问此漫画");
        }

        // 检查页码是否已存在
        const existingScene = comic.scenes?.find(
          (scene) => scene.scene_order === page_number
        );
        if (existingScene) {
          throw new Error(`第${page_number}页已存在，请选择其他页码`);
        }

        // 生成新页面
        const result = await comicGenerationService.addPageToComic({
          userId: user.id,
          comicId: comic_id,
          pageNumber: page_number,
          content: content, // 使用content
          style: style || comic.style,
          controller: helper["controller"],
          encoder: helper["encoder"],
        });

        helper.sendComplete(result, `第${page_number}页添加完成！`);
      }
    );
  } catch (error) {
    console.error("添加漫画页面时出错:", error);
    return handleApiError(error);
  }
}
