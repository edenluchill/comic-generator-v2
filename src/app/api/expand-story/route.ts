import { NextRequest } from "next/server";
import { authenticateRequired } from "@/lib/helpers/auth-extensions.helpers";
import {
  createAuthErrorResponse,
  createValidationErrorResponse,
  handleApiError,
} from "@/lib/helpers/api-response.helpers";
import {
  validateRequestBody,
  validateRequiredFields,
} from "@/lib/helpers/request-validation.helpers";
import { creditService } from "@/lib/services/credit.service";

interface ExpandStoryRequest {
  story: string;
  characters: Array<{ id: string; name: string; avatar_url: string }>;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
  format?: "single" | "four";
}

interface ExpandStoryResponse {
  expandedStory: string;
  environment: string;
  mood: string;
  additionalDetails: string;
}

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { user, error: authError } = await authenticateRequired(request);
    if (authError || !user) {
      return createAuthErrorResponse(authError ?? undefined);
    }

    // 请求体验证
    const {
      isValid: bodyValid,
      data: body,
      errors: bodyErrors,
    } = await validateRequestBody<ExpandStoryRequest>(request);

    if (!bodyValid) {
      return createValidationErrorResponse(bodyErrors.join(", "));
    }

    // 字段验证
    const { isValid: fieldsValid, errors: fieldErrors } =
      validateRequiredFields(body! as unknown as Record<string, unknown>, ["story", "characters"]);

    if (!fieldsValid) {
      return createValidationErrorResponse(fieldErrors.join(", "));
    }

    const { story, characters, style = "cute" } = body!;

    // 检查用户余额
    const hasCredits = await creditService.checkCredits(user.id, 1);
    if (!hasCredits) {
      return new Response(
        JSON.stringify({
          error: "积分不足，无法扩展故事",
          code: "INSUFFICIENT_CREDITS",
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 构建角色信息
    const characterNames = characters.map(c => c.name).join("、");
    
    // 获取格式参数
    const format = (body as ExpandStoryRequest).format || "four";
    
    let prompt: string;
    
    if (format === "single") {
      // 海报模式：单个详细场景
      prompt = `你是一个专业的漫画故事扩展专家。请基于用户提供的故事大纲，将其扩展成一个详细的单幅海报场景描述。

用户故事：${story}
涉及角色：${characterNames}
风格偏好：${style}
输出格式：单幅海报场景

请将故事扩展成一个完整的场景，重点描述：

1. **核心场景**：将故事浓缩成一个最具代表性的关键时刻
2. **环境细节**：详细的背景、道具、光线、色彩等视觉元素
3. **角色状态**：角色的姿势、表情、服装、位置关系
4. **情感氛围**：整个画面传达的情感和意境
5. **构图元素**：适合海报展示的视觉构图

请以JSON格式返回结果：
{
  "expandedStory": "详细的单幅场景描述，适合制作成海报",
  "environment": "环境背景的详细描述",
  "mood": "画面的整体氛围和情感基调",
  "additionalDetails": "重要的视觉细节和构图要素"
}

注意：
- 专注于一个核心场景，不要分散到多个情节
- 描述要具有强烈的视觉冲击力
- 适合制作成静态海报展示
- 体现${style}风格的特点`;
    } else {
      // 四格漫画模式：四个连续场景
      prompt = `你是一个专业的漫画故事扩展专家。请基于用户提供的故事大纲，将其扩展成四个连续的漫画场景。

用户故事：${story}
涉及角色：${characterNames}
风格偏好：${style}
输出格式：四格漫画

请将故事扩展成四个连续的场景，每个场景要：

1. **场景1 (起)**：故事的开端，介绍角色和背景
2. **场景2 (承)**：情节发展，增加互动和细节
3. **场景3 (转)**：故事的转折或高潮部分
4. **场景4 (合)**：故事的结局或收尾

每个场景都要包含：
- 具体的场景描述
- 角色的动作和表情
- 必要的对话或内心独白
- 场景间的连贯性

请以JSON格式返回结果：
{
  "expandedStory": "四个场景的完整描述，用'===场景分割===;'分隔每个场景",
  "environment": "各场景的环境设定描述",
  "mood": "整个故事的情感发展脉络",
  "additionalDetails": "角色关系和情节发展的重要细节"
}

注意：
- 确保四个场景逻辑连贯，节奏合理
- 每个场景都要有明确的视觉重点
- 体现${style}风格的特点
- 适合四格漫画的叙事节奏`;
    }

    // 调用 ChatGPT API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的漫画故事扩展专家，擅长为漫画创作提供丰富的故事细节。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API 错误:", openaiResponse.status, errorText);
      throw new Error(`OpenAI API 调用失败: ${openaiResponse.status} - ${errorText.substring(0, 100)}`);
    }

    const openaiData = await openaiResponse.json();
    console.log("OpenAI API 响应:", JSON.stringify(openaiData, null, 2));
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("无法获取故事扩展结果");
    }

    // 解析 JSON 响应 - 先清理 markdown 代码块
    let expandedData: ExpandStoryResponse;
    try {
      console.log("尝试解析 JSON 内容:", content.substring(0, 200) + "...");
      
      // 移除 markdown 代码块标记
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '');
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.replace(/\s*```$/, '');
      }
      
      console.log("清理后的内容:", cleanContent.substring(0, 200) + "...");
      expandedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON 解析失败:", parseError);
      console.log("原始内容:", content);
      
      // 尝试提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          expandedData = JSON.parse(jsonMatch[0]);
          console.log("使用正则提取的 JSON 解析成功");
        } catch (secondParseError) {
          console.error("第二次 JSON 解析也失败:", secondParseError);
          // 如果都失败，创建一个基本的结构
          expandedData = {
            expandedStory: content,
            environment: "故事发生的环境描述",
            mood: "故事的情感基调",
            additionalDetails: "额外的故事细节",
          };
        }
      } else {
        // 如果找不到 JSON，创建一个基本的结构
        expandedData = {
          expandedStory: content,
          environment: "故事发生的环境描述",
          mood: "故事的情感基调",
          additionalDetails: "额外的故事细节",
        };
      }
    }

    // 扣除积分
    await creditService.deductCredits({
      userId: user.id,
      amount: 1,
      description: "故事扩展服务",
      relatedEntityType: "story_expansion",
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: expandedData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("扩展故事时出错:", error);
    return handleApiError(error);
  }
}
