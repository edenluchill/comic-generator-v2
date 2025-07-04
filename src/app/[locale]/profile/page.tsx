"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Mail,
  Calendar,
  Crown,
  Settings,
  Heart,
  Image,
  BookOpen,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Stars,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const tProfile = useTranslations("Profile");
  const tAccount = useTranslations("Account");
  const { user, profile, loading, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 如果用户未登录，重定向到登录页面
  if (!loading && !user && !isLoggingOut) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-700">
            {tProfile("profileNotFound") || "Profile not found"}
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
            {tProfile("backToHome") || "Back to Home"}
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // 这里可以添加保存逻辑
    console.log("Save profile:", editName);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-10 animate-pulse delay-500">
          <Stars className="w-6 h-6 text-amber-400" />
        </div>
        <div className="absolute bottom-40 right-20 opacity-8 animate-pulse delay-1000">
          <Stars className="w-4 h-4 text-yellow-400" />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-amber-700 hover:bg-amber-100/80 rounded-full transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tProfile("back") || "Back"}
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 个人资料卡片 */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-amber-200/30 shadow-xl rounded-3xl">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold text-amber-900">
                {tProfile("profileTitle") || "My Profile"}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-amber-700 hover:bg-amber-100/80 rounded-full"
              >
                {isEditing ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Edit2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 头像区域 */}
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name || "User"}
                        className="w-full h-full rounded-full object-cover border-4 border-amber-200/50"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center border-4 border-amber-200/50">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {profile.subscription_status === "premium" && (
                      <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-amber-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white/80 text-center"
                          placeholder={tProfile("enterName") || "Enter name"}
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {tProfile("save") || "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                            className="text-amber-700"
                          >
                            {tProfile("cancel") || "Cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-semibold text-amber-900">
                          {profile.name || tProfile("noName") || "No Name"}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span
                            className={`text-sm px-3 py-1 rounded-full ${
                              profile.subscription_status === "premium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {profile.subscription_status === "premium"
                              ? "Premium"
                              : "Free"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-amber-50/60 rounded-xl">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-600">
                        {tProfile("email") || "Email"}
                      </p>
                      <p className="font-medium text-amber-900 text-sm">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-amber-50/60 rounded-xl">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-600">
                        {tProfile("joinDate") || "Join Date"}
                      </p>
                      <p className="font-medium text-amber-900 text-sm">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 使用统计 */}
                {profile.usage_stats && (
                  <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {tProfile("usageStats") || "Usage Statistics"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <Image className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-amber-600">
                            {tProfile("imagesGenerated") || "Images Generated"}
                          </p>
                          <p className="text-xl font-bold text-amber-900">
                            {profile.usage_stats.images_generated || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-600">
                            {tProfile("storiesCreated") || "Stories Created"}
                          </p>
                          <p className="text-xl font-bold text-orange-900">
                            {profile.usage_stats.stories_created || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 快速操作 */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-amber-200/30 shadow-xl rounded-3xl">
            <h3 className="text-xl font-semibold text-amber-900 mb-4">
              {tProfile("quickActions") || "Quick Actions"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/workshop")}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/30 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Image className="w-6 h-6 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {tProfile("createNew") || "Create New"}
                </span>
              </Button>

              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/30 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Heart className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-amber-900">
                  {tAccount("myWorks") || "My Works"}
                </span>
              </Button>

              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/30 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-6 h-6 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {tAccount("settings") || "Settings"}
                </span>
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-red-50/60 hover:bg-red-100/80 border border-red-200/30 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <LogOut
                  className={`w-6 h-6 text-red-600 ${
                    isLoggingOut ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm font-medium text-red-900">
                  {isLoggingOut
                    ? tAccount("loggingOut") || "Logging Out..."
                    : tAccount("logout") || "Logout"}
                </span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
