import { NextResponse } from "next/server";
import { APIResponse } from "@/types/api";

/**
 * 创建标准化的API成功响应
 */
export function createSuccessResponse<T = unknown>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json<APIResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 创建标准化的API错误响应
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 400
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error;

  return NextResponse.json<APIResponse>(
    {
      success: false,
      error: errorMessage,
    },
    { status }
  );
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(message?: string): NextResponse {
  return createErrorResponse(message || "未授权访问", 401);
}

/**
 * 创建验证错误响应
 */
export function createValidationErrorResponse(message: string): NextResponse {
  return createErrorResponse(message, 400);
}

/**
 * 创建服务器内部错误响应
 */
export function createInternalErrorResponse(
  error: string | Error = "服务器内部错误"
): NextResponse {
  return createErrorResponse(error, 500);
}

/**
 * 安全的错误处理包装器
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }

  return createInternalErrorResponse();
}
