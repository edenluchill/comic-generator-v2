import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  error: string | null;
  isAnonymous: boolean;
}

export interface OptionalAuthResult extends AuthResult {
  userId?: string;
}

/**
 * 严格认证 - 必须有有效用户
 */
export async function authenticateRequired(
  request: NextRequest
): Promise<AuthResult> {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? undefined;

    if (!token) {
      return { user: null, error: "No token provided", isAnonymous: true };
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { user: null, error: "Invalid token", isAnonymous: true };
    }

    return { user, error: null, isAnonymous: false };
  } catch (error) {
    console.error("Authentication error:", error);
    return { user: null, error: "Authentication failed", isAnonymous: true };
  }
}

/**
 * 可选认证 - 支持匿名用户
 */
export async function authenticateOptional(
  request: NextRequest
): Promise<OptionalAuthResult> {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? undefined;

    if (!token) {
      return { user: null, error: null, isAnonymous: true };
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return { user: null, error: null, isAnonymous: true, userId: undefined };
    }

    return { user, error: null, isAnonymous: false, userId: user.id };
  } catch (error) {
    console.error("Optional authentication error:", error);
    return { user: null, error: null, isAnonymous: true };
  }
}

/**
 * 检查用户权限
 */
export function checkUserPermission(
  user: User | null,
  requiredUserId?: string
): boolean {
  if (!user) return false;
  if (!requiredUserId) return true;
  return user.id === requiredUserId;
}
