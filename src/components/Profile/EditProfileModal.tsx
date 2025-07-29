import { FC, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile, UpdateUserProfileRequest } from "@/types/credits";
import { User, Upload, X, Save, Loader2 } from "lucide-react";
import {
  makeAuthenticatedJsonRequest,
  makeAuthenticatedRequest,
} from "@/lib/auth-request";

interface EditProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        setIsUploading(true);
        const updatedProfile = await uploadAvatar(file);
        setCurrentProfile(updatedProfile);
        // 立即通知父组件更新
        onSave(updatedProfile);
      } catch (error) {
        console.error("上传头像失败:", error);
        alert("上传头像失败，请重试");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const uploadAvatar = async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await makeAuthenticatedRequest("/api/replace-avatar", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传头像失败: ${errorText}`);
    }

    const result = await response.json();
    return result.profile;
  };

  const updateProfile = async (
    updates: UpdateUserProfileRequest
  ): Promise<UserProfile> => {
    const result = await makeAuthenticatedJsonRequest<{
      profile: UserProfile;
    }>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    return result.profile;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let updatedProfile = currentProfile;

      // 如果用户名有变化，更新用户名
      if (fullName !== currentProfile.full_name) {
        const updates: UpdateUserProfileRequest = {
          full_name: fullName,
        };
        updatedProfile = await updateProfile(updates);
      }

      // 如果没有任何更改，直接关闭
      if (fullName === currentProfile.full_name) {
        onClose();
        return;
      }

      // 通知父组件更新
      onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  // 获取当前显示的头像
  const getCurrentAvatar = () => {
    if (currentProfile.override_avatar_url)
      return currentProfile.override_avatar_url;
    if (currentProfile.avatar_url) return currentProfile.avatar_url;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">编辑资料</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 头像编辑 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white overflow-hidden">
                {getCurrentAvatar() ? (
                  <Image
                    src={getCurrentAvatar()!}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>

              {/* 上传按钮 */}
              <label
                className={`absolute -bottom-2 -right-2 w-8 h-8 ${
                  isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded-full flex items-center justify-center cursor-pointer transition-colors`}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            <p className="text-sm text-gray-600 text-center">
              {isUploading ? "正在上传头像..." : "点击上传按钮更换头像"}
            </p>
          </div>

          {/* 姓名编辑 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">姓名</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的姓名"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSaving || isUploading}
            >
              取消
            </Button>
            <Button
              className="flex-1 flex items-center gap-2"
              onClick={handleSave}
              disabled={isSaving || isUploading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { EditProfileModal };
