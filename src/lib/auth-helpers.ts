import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function authenticateRequest(request: NextRequest) {
  try {
    // 方法1：从Authorization header获取token
    let token = request.headers.get("authorization")?.replace("Bearer ", "");

    // 方法2：如果没有header token，尝试从cookies获取refresh token
    if (!token) {
      const refreshToken = request.cookies.get("refreshToken")?.value;

      if (refreshToken) {
        try {
          // 使用refresh token获取新的access token
          const { data, error } = await supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken,
          });

          if (!error && data.session) {
            token = data.session.access_token;
          }
        } catch (e) {
          console.log("Failed to refresh session:", e);
        }
      }
    }

    if (!token) {
      return { user: null, error: "No token provided" };
    }

    // 使用管理员客户端验证token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { user: null, error: "Invalid token" };
    }

    return { user, error: null };
  } catch (error) {
    console.error("Authentication error:", error);
    return { user: null, error: "Authentication failed" };
  }
}

// 🔒 API 路由速率限制（简单实现）
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1分钟
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now - entry.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
