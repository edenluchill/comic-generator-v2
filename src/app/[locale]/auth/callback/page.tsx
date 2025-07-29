"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { Loader } from "@/components/ui/loading";

export default function AuthCallbackPage() {
  const { navigate } = useLocalizedNavigation();
  const tLogin = useTranslations("Login");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取保存的返回地址
        const returnUrl = sessionStorage.getItem("returnUrl") || "/";
        sessionStorage.removeItem("returnUrl"); // 清除保存的返回地址

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
          navigate("/auth/error?error=" + encodeURIComponent(error));
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
            navigate(
              "/auth/error?error=" + encodeURIComponent(sessionError.message)
            );
            return;
          }

          if (data.session) {
            // 成功登录，重定向到保存的返回地址
            navigate(returnUrl);
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
              navigate(
                "/auth/error?error=" + encodeURIComponent(codeError.message)
              );
              return;
            }

            if (data.session) {
              // 成功登录，重定向到保存的返回地址
              navigate(returnUrl);
            }
          } else {
            // 没有找到认证信息
            navigate("/auth/error?error=no_auth_info");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate(
          "/auth/error?error=" +
            encodeURIComponent(
              error instanceof Error ? error.message : "unknown_error"
            )
        );
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <Loader
          message={tLogin("loggingIn")}
          color="primary"
          size="md"
          iconSize={20}
        />
        <p className="text-amber-700">{tLogin("verifyingIdentity")}</p>
      </div>
    </div>
  );
}
