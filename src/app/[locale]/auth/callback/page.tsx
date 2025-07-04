"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";

export default function AuthCallbackPage() {
  const router = useRouter();
  const tLogin = useTranslations("Login");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 检查 URL hash 中的参数
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          console.error("Auth error:", error, errorDescription);
          router.push("/auth/error?error=" + encodeURIComponent(error));
          return;
        }

        if (accessToken && refreshToken) {
          // 设置会话
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            router.push(
              "/auth/error?error=" + encodeURIComponent(sessionError.message)
            );
            return;
          }

          if (data.session) {
            // 成功登录，重定向到首页
            router.push("/");
          }
        } else {
          // 尝试从 URL 参数获取 code（用于服务器端流程）
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");

          if (code) {
            // 交换 code 为 session
            const { data, error: codeError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (codeError) {
              console.error("Code exchange error:", codeError);
              router.push(
                "/auth/error?error=" + encodeURIComponent(codeError.message)
              );
              return;
            }

            if (data.session) {
              router.push("/");
            }
          } else {
            // 没有找到认证信息
            router.push("/auth/error?error=no_auth_info");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push(
          "/auth/error?error=" +
            encodeURIComponent(
              error instanceof Error ? error.message : "unknown_error"
            )
        );
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <h2 className="mt-6 text-2xl font-bold text-amber-900">
          {tLogin("loggingIn")}
        </h2>
        <p className="text-amber-700">{tLogin("verifyingIdentity")}</p>
      </div>
    </div>
  );
}
