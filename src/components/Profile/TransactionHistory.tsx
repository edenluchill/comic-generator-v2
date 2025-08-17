import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Calendar, Crown, Clock } from "lucide-react";
import { CreditTransaction } from "@/types/credits";
import { SimpleSpinner } from "@/components/ui/loading";

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
  loading?: boolean;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deduction":
      return <TrendingUp className="w-4 h-4 text-destructive" />;
    case "refill":
      return <Zap className="w-4 h-4 text-chart-3" />;
    case "monthly_reset":
      return <Calendar className="w-4 h-4 text-chart-2" />;
    case "subscription_bonus":
      return <Crown className="w-4 h-4 text-primary" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const TransactionHistory: FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
}) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">最近交易记录</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <SimpleSpinner size="md" color="primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无交易记录
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString("zh-CN")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.amount > 0
                        ? "text-chart-3"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">
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
            className="hover:bg-secondary/50 hover:border-primary/30"
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
