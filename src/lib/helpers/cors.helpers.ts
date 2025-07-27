import { NextResponse } from "next/server";

/**
 * 创建CORS headers
 */
export function createCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/**
 * 处理OPTIONS请求（CORS预检）
 */
export function handleOptionsRequest(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: createCorsHeaders(),
  });
}

/**
 * 为响应添加CORS headers
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  const corsHeaders = createCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
