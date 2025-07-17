"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { Mail, ArrowLeft, Loader2, Stars, Heart, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { navigate } = useLocalizedNavigation();
  const tLogin = useTranslations("Login");
  const { signInWithGoogle, signInWithEmail, verifyEmailCode } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"method" | "email" | "verify">("method");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Google login failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email);
      setStep("verify");
    } catch (error) {
      console.error("Email login failed:", error);
      setError("Email login failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await verifyEmailCode(email, code);

      // 登录成功后跳转到保存的返回地址
      const returnUrl = sessionStorage.getItem("returnUrl") || "/";
      sessionStorage.removeItem("returnUrl"); // 清除保存的返回地址
      navigate(returnUrl);
    } catch (error) {
      console.error("Code verification failed:", error);
      setError("Verification code is incorrect, please try again");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "email") {
      setStep("method");
    } else if (step === "verify") {
      setStep("email");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 relative overflow-hidden">
      {/* 背景装饰 - 与主页相同 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 浮动元素 */}
        <div className="absolute top-20 left-10 opacity-10 animate-pulse delay-500">
          <Stars className="w-6 h-6 text-amber-400" />
        </div>
        <div className="absolute top-40 right-20 opacity-10 animate-bounce delay-700">
          <Heart className="w-5 h-5 text-orange-300" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-8 animate-pulse delay-1000">
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="absolute top-60 right-40 opacity-8 animate-float delay-300">
          <Stars className="w-4 h-4 text-amber-300" />
        </div>
        <div className="absolute bottom-60 right-10 opacity-10 animate-bounce delay-500">
          <Heart className="w-3 h-3 text-orange-400" />
        </div>

        {/* 背景圆点 */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-300/30 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-300/20 rounded-full animate-ping delay-700"></div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-amber-200/30 shadow-xl rounded-3xl animate-fade-in-up hover:shadow-2xl transition-all duration-700">
          {/* Header */}
          <div className="text-center relative">
            {step !== "method" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="absolute left-0 top-0 text-amber-700 hover:bg-amber-100/80 hover:backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 z-10 w-10 h-10 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            <div className="animate-slide-in-down">
              <h1 className="text-3xl font-bold text-amber-900 mb-3 animate-fadeIn">
                {step === "verify"
                  ? tLogin("welcomeSignup") || "Welcome to Sign Up"
                  : tLogin("welcome") || "Welcome"}
              </h1>
              <p
                className="text-amber-700 text-sm animate-fadeIn"
                style={{ animationDelay: "200ms" }}
              >
                {step === "verify"
                  ? tLogin("signupSubtitle") ||
                    "Enter verification code to complete registration"
                  : tLogin("subtitle") || "Choose your login method"}
              </p>
            </div>

            {/* 装饰线 */}
            <div className="w-12 h-0.5 bg-amber-300 mx-auto mt-4 rounded-full animate-shimmer"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-700 text-sm animate-fade-in-up shadow-sm">
              {error}
            </div>
          )}

          {/* Method Selection */}
          {step === "method" && (
            <div
              className="space-y-5 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/50 text-amber-700 hover:text-amber-800 transition-all duration-300 rounded-xl hover:scale-105 backdrop-blur-sm group shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <FcGoogle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                )}
                {tLogin("googleLogin") || "Sign in with Google"}
              </Button>
              <Button
                onClick={() => setStep("email")}
                className="w-full h-12 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/50 text-amber-700 hover:text-amber-800 transition-all duration-300 rounded-xl hover:scale-105 backdrop-blur-sm group shadow-md hover:shadow-lg"
              >
                <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                {tLogin("emailLogin") || "Sign in with Email / Register"}
              </Button>
            </div>
          )}

          {/* Email Input */}
          {step === "email" && (
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-5 animate-fade-in-up"
            >
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  {tLogin("emailAddress") || "Email Address"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-amber-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/50 text-amber-900"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-amber-600 mt-2">
                  {tLogin("emailHint") ||
                    "New email will create an account automatically, existing email will receive a login verification code"}
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                {tLogin("sendCode") || "Send Code"}
              </Button>
            </form>
          )}

          {/* Code Verification */}
          {step === "verify" && (
            <form
              onSubmit={handleCodeVerify}
              className="space-y-5 animate-fade-in-up"
            >
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  {tLogin("verificationCode") || "Verification Code"}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-amber-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/50 text-center text-lg tracking-widest text-amber-900"
                  placeholder={tLogin("codePlaceholder") || "6-digit code"}
                  maxLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                {tLogin("verifyCode") || "Verify & Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("email")}
                className="w-full text-amber-700 hover:bg-amber-50/80 hover:backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105"
              >
                {tLogin("resendCode") || "Resend Code"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
