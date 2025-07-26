import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Calendar, Crown, Clock } from "lucide-react";
import { CreditTransaction } from "@/types/credits";

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
  loading?: boolean; // Add loading prop
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deduction":
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    case "refill":
      return <Zap className="w-4 h-4 text-green-500" />;
    case "monthly_reset":
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case "subscription_bonus":
      return <Crown className="w-4 h-4 text-amber-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const TransactionHistory: FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">最近交易记录</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无交易记录</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleString("zh-CN")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </div>
                  <div className="text-xs text-gray-500">
                    余额: {transaction.balance_after}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              /* TODO: 查看完整历史 */
            }}
          >
            查看完整历史
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { TransactionHistory };
