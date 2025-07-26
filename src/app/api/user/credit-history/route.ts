import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { creditService } from "@/lib/services/credit.service";

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 验证参数
    if (limit > 100 || limit < 1) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    // 获取交易历史
    const transactions = await creditService.getCreditTransactions(
      user.id,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error("Get credit history error:", error);
    return NextResponse.json(
      { error: "Failed to get credit history" },
      { status: 500 }
    );
  }
}
