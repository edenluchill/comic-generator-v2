# 5 页漫画生成功能

## 概述

新的 5 页漫画生成功能允许 AI 助手从用户提供的简短故事中自动创建完整的 5 页漫画。该功能包括故事扩展、场景生成和图片创建，并提供实时进度更新。

## 功能特点

### 1. 智能故事扩展

- 使用 GPT-4o-mini 将简短故事扩展为 5 个详细场景
- 遵循经典故事结构：设置、上升动作、高潮、下降动作、结局
- 为每个场景生成详细的视觉描述、情绪和引用语句

### 2. 完整漫画生成

- 自动生成 5 页漫画，每页一个场景
- 支持多种艺术风格（cute、realistic、minimal、kawaii 等）
- 为每个场景生成高质量图片
- 自动保存到数据库

### 3. 实时进度流式传输

- 通过 Server-Sent Events 提供实时进度更新
- 显示每个步骤的详细状态
- 支持前端实时显示生成进度

## 技术架构

### 服务层

1. **StoryExpansionService** (`src/lib/services/story-expansion.service.ts`)

   - 负责将用户故事扩展为 5 页场景
   - 使用 OpenAI GPT-4o-mini 进行智能扩展

2. **FivePageComicService** (`src/lib/services/five-page-comic.service.ts`)
   - 协调整个 5 页漫画生成流程
   - 处理 credits 检查、场景创建、图片生成
   - 提供流式进度更新

### AI 工具集成

3. **generateComic Tool** (`src/lib/ai/tools/generate-comic.ts`)
   - 作为 AI 助手的工具，可以被 chat API 调用
   - 支持用户上下文和认证
   - 返回生成结果和状态

### API 端点

4. **Chat API** (`src/app/api/chat/route.ts`)
   - 集成了 comic generation 工具
   - 支持用户认证和匿名聊天
   - AI 助手可以自动调用漫画生成功能

## 使用方法

### 1. 通过 Chat API 使用

用户可以在聊天中直接请求生成漫画：

```
用户: "请帮我生成一个关于小女孩发现魔法花园的5页漫画"
AI助手: 会自动调用generateComic工具来创建漫画
```

### 2. 直接 API 调用

也可以直接调用测试 API 端点：

```bash
POST /api/test-five-page-comic
Content-Type: application/json

{
  "story": "A young girl discovers a magical garden behind her grandmother's house.",
  "style": "cute",
  "userId": "user-123"
}
```

### 3. 进度监控

API 返回 Server-Sent Events 流，包含以下进度信息：

```javascript
// 进度更新事件
{
  "type": "progress",
  "step": "expanding", // checking, expanding, creating, generating, finalizing
  "message": "正在将故事扩展为5页场景...",
  "progress": 15 // 0-100
}

// 最终结果事件
{
  "type": "final_result",
  "data": {
    "comic_id": "comic-uuid",
    "scenes": [...], // 5个场景对象
    "title": "魔法花园的秘密",
    "status": "completed"
  }
}
```

## 配置要求

### 环境变量

```env
MYOPENAI_API_KEY=your-openai-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 数据库表

确保以下表存在：

- `comics` - 漫画记录
- `comic_scenes` - 场景记录
- `user_profiles` - 用户档案
- `credit_transactions` - 积分交易

### Credits 成本

- 每页漫画生成消耗 `CREDIT_COSTS.COMIC_GENERATION` credits
- 5 页漫画总共消耗 5 × `CREDIT_COSTS.COMIC_GENERATION` credits

## 错误处理

系统包含完整的错误处理：

- Credits 不足时会提前检查并报错
- 生成失败时会回滚操作
- 所有错误都会通过流式 API 返回给前端

## 开发和测试

### 测试 API

使用 `/api/test-five-page-comic` 端点进行功能测试：

```bash
# 获取API信息
GET /api/test-five-page-comic

# 测试漫画生成
POST /api/test-five-page-comic
```

### 调试

- 查看控制台日志了解详细执行过程
- 检查数据库记录确认数据正确保存
- 监控 credits 扣减是否正确

## 后续优化

1. **性能优化**

   - 并行生成多个场景图片
   - 缓存常用故事模板
   - 优化数据库查询

2. **功能扩展**

   - 支持自定义页数（3-10 页）
   - 添加更多艺术风格
   - 支持角色一致性

3. **用户体验**
   - 预览模式
   - 编辑和重新生成功能
   - 导出为 PDF 或其他格式
