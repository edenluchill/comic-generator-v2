import { FC, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Crown,
  LogOut,
  Edit3,
  CheckCircle,
  Star,
} from "lucide-react";
import { UserProfile } from "@/types/credits";
import { EditProfileModal } from "./EditProfileModal";

interface UserInfoCardProps {
  profile: UserProfile;
  onSignOut: () => void;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
  formatDate: (dateString: string) => string;
}

const UserInfoCard: FC<UserInfoCardProps> = ({
  profile,
  onSignOut,
  onProfileUpdate,
  formatDate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isPremium = profile.subscription_tier === "premium";
  const memberSince = formatDate(profile.created_at);

  // 获取显示用的头像 - 优先使用override_avatar_url
  const getDisplayAvatar = () => {
    return profile.override_avatar_url || profile.avatar_url;
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
  };

  return (
    <>
      <Card
        className={`${
          isPremium
            ? "bg-gradient-to-br from-secondary/50 to-accent/30 border-primary/30 shadow-lg shadow-primary/10"
            : "bg-card shadow-md"
        } transition-all duration-200 border border-border`}
      >
        {/* 头像和基本信息区域 */}
        <CardHeader className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-xl">
              {getDisplayAvatar() ? (
                <Image
                  src={getDisplayAvatar()!}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover"
                  width={112}
                  height={112}
                />
              ) : (
                <User className="w-14 h-14" />
              )}
            </div>
            {isPremium && (
              <div className="absolute -top-1 -right-1">
                <Crown className="w-10 h-10 text-primary bg-card rounded-full p-2 shadow-lg border-2 border-primary/30" />
              </div>
            )}
          </div>

          <CardTitle>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                {profile.full_name || "未设置姓名"}
              </h2>
              {isPremium && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-secondary to-accent/50 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                  <Star className="w-4 h-4" />
                  拾光伙伴
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 账户信息区域 */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {profile.email}
                </span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">加入时间: {memberSince}</span>
              </div>

              {isPremium && profile.subscription_expires_at && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-chart-3" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      订阅至: {formatDate(profile.subscription_expires_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮区域 */}
          <div className="pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 hover:bg-secondary/50 hover:border-primary/30 transition-colors"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit3 className="w-4 h-4" />
                编辑资料
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                onClick={onSignOut}
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileUpdate}
      />
    </>
  );
};

export { UserInfoCard };
