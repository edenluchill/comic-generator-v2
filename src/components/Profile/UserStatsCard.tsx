import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/types/credits";

interface UserStatsCardProps {
  profile: UserProfile;
}

const UserStatsCard: FC<UserStatsCardProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">使用统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {profile.total_comics_generated}
            </div>
            <div className="text-sm text-gray-500">生成漫画</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {profile.total_characters_created}
            </div>
            <div className="text-sm text-gray-500">创建角色</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserStatsCard };
