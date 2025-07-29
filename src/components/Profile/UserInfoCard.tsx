import { FC } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import {
  User,
  Mail,
  Calendar,
  Crown,
  Settings,
  LogOut,
  Edit3,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { UserProfile } from "@/types/credits";

interface UserInfoCardProps {
  profile: UserProfile;
  onSignOut: () => void;
  formatDate: (dateString: string) => string;
}

const UserInfoCard: FC<UserInfoCardProps> = ({
  profile,
  onSignOut,
  formatDate,
}) => {
  const { navigate } = useLocalizedNavigation();
  const isPremium = profile.subscription_tier === "premium";
  const memberSince = formatDate(profile.created_at);
  const nextResetDate = formatDate(profile.credits_reset_date);

  return (
    <Card
      className={`${
        isPremium
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
          : "bg-white"
      }`}
    >
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
                width={96}
                height={96}
              />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          {isPremium && (
            <div className="absolute -top-2 -right-2">
              <Crown className="w-8 h-8 text-amber-500 bg-white rounded-full p-1 shadow-md" />
            </div>
          )}
        </div>

        <CardTitle>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              {profile.full_name || "未设置姓名"}
            </h2>
            {isPremium && (
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                <Star className="w-3 h-3" />
                拾光伙伴
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="text-sm">{profile.email}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">加入时间: {memberSince}</span>
        </div>

        {isPremium && profile.subscription_expires_at && (
          <div className="flex items-center gap-3 text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              订阅至: {formatDate(profile.subscription_expires_at)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">下次重置: {nextResetDate}</span>
        </div>

        <div className="pt-4 border-t space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => {
              /* TODO: 实现编辑功能 */
            }}
          >
            <Edit3 className="w-4 h-4" />
            编辑资料
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
            账户设置
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserInfoCard };
