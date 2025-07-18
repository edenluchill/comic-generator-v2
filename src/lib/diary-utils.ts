/**
 * 日记相关的工具函数
 */

/**
 * 格式化日期显示
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * 获取状态对应的样式类名
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-50";
    case "processing":
      return "text-blue-600 bg-blue-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "failed":
      return "text-red-600 bg-red-50";
    case "draft":
      return "text-gray-600 bg-gray-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

/**
 * 获取状态对应的中文文本
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case "completed":
      return "已完成";
    case "processing":
      return "生成中";
    case "pending":
      return "等待中";
    case "failed":
      return "失败";
    case "draft":
      return "草稿";
    default:
      return "未知";
  }
};
