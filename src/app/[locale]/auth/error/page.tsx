"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    setError(errorParam || "未知错误");
  }, [searchParams]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "access_denied":
        return "登录被拒绝。您可能取消了登录或拒绝了权限。";
      case "invalid_request":
        return "登录请求无效。请重试。";
      case "server_error":
        return "服务器错误。请稍后重试。";
      case "temporarily_unavailable":
        return "服务暂时不可用。请稍后重试。";
      case "no_auth_info":
        return "未收到认证信息。请重新登录。";
      default:
        return `登录过程中发生错误: ${error}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-md w-full space-y-8 text-center p-8">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">登录失败</h2>

          <p className="text-amber-700">{getErrorMessage(error)}</p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            重新登录
          </Button>
        </div>
      </div>
    </div>
  );
}
