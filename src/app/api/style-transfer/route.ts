import { NextRequest } from "next/server";
import { styleTransferService } from "@/lib/services/style-transfer.service";
import { creditService } from "@/lib/services/credit.service";
import { authenticateOptional } from "@/lib/helpers/auth-extensions.helpers";
import {
  createSuccessResponse,
  handleApiError,
  createValidationErrorResponse,
} from "@/lib/helpers/api-response.helpers";
import { handleOptionsRequest } from "@/lib/helpers/cors.helpers";
import { CREDIT_COSTS } from "@/types/credits";

export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function POST(request: NextRequest) {
  try {
    console.log("Style transfer API called");
    
    // Try to authenticate user (optional)
    const { user, error, userId } = await authenticateOptional(request);
    if (user && !error) {
      console.log("User authenticated:", userId);
    } else {
      console.log("User not authenticated, proceeding without credits");
    }

    // Parse form data
    const formData = await request.formData();
    const baseImage = formData.get("baseImage") as File;
    const styleReference = formData.get("styleReference") as File;
    const prompt = formData.get("prompt") as string;

    console.log("Form data parsed:", {
      hasBaseImage: !!baseImage,
      hasStyleReference: !!styleReference,
      baseImageType: baseImage?.type,
      styleReferenceType: styleReference?.type,
      prompt: prompt?.substring(0, 50) + "..."
    });

    if (!baseImage || !styleReference) {
      return createValidationErrorResponse("需要提供基础图片和风格参考图片");
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(baseImage.type) || !allowedTypes.includes(styleReference.type)) {
      return createValidationErrorResponse("只支持 JPEG、PNG 和 WebP 格式的图片");
    }

    // Validate file sizes (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (baseImage.size > maxSize || styleReference.size > maxSize) {
      return createValidationErrorResponse("图片大小不能超过 10MB");
    }

    // Check credits (only if user is authenticated)
    if (userId) {
      const requiredCredits = CREDIT_COSTS.STYLE_TRANSFER;
      const creditCheck = await creditService.checkCredits(userId, requiredCredits);
      
      if (!creditCheck.hasEnoughCredits) {
        return createValidationErrorResponse(`积分不足，需要 ${requiredCredits} 积分进行风格转换`);
      }
    }

    // Convert images to base64
    const baseImageBase64 = await styleTransferService.fileToBase64(baseImage);
    const styleReferenceBase64 = await styleTransferService.fileToBase64(styleReference);

    // Perform style transfer
    const result = await styleTransferService.transferStyle({
      baseImage: baseImageBase64,
      styleReference: styleReferenceBase64,
      prompt: prompt || "Restyle the base image to match the color palette and brushwork of the style reference. Keep composition and subject unchanged.",
      outputFormat: "png",
      userId,
    });

    // Deduct credits (only if user is authenticated)
    if (userId) {
      await creditService.deductCredits({
        userId,
        amount: CREDIT_COSTS.STYLE_TRANSFER,
        description: "风格转换服务",
        relatedEntityType: "style_transfer",
        metadata: {
          prompt,
          baseImageName: baseImage.name,
          styleReferenceName: styleReference.name,
        },
      });
    }

    return createSuccessResponse(result, "风格转换成功");
  } catch (error) {
    console.error("风格转换失败:", error);
    return handleApiError(error);
  }
}
