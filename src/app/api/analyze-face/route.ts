import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { APIResponse } from "@/types/api";
import { CaricatureAnalysis } from "@/types/caricature-analysis";

const openai = new OpenAI({
  apiKey:
    "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", // 建议使用环境变量
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "未上传图片",
      });
    }

    // 将图片转换为base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString(
      "base64"
    )}`;

    // 使用OpenAI Vision API进行简笔画角色分析
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 修正模型名称
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `作为一个专业的简笔画/讽刺画艺术家，请分析这张照片中人物的脸部特征，专注于简笔画角色创作。

请仔细观察并提供以下分析：

1. **最突出特征识别**：
   - 找出最引人注目的1个主要特征
   - 识别2-3个次要特征
   - 发现任何独特或有趣的特征

2. **几何形状简化**：
   - 将脸部各部分简化为基本几何形状
   - 分析眼、鼻、嘴的基本形状和比例
   - 确定整体脸型的几何特征

3. **关键比例测量**：
   - 面部长宽比
   - 眼部、鼻部、嘴部的相对位置
   - 各特征的相对大小

4. **简笔画绘制指导**：
   - 建议绘制顺序
   - 描述关键线条
   - 指出需要强调的要点

5. **风格和优先级**：
   - 推荐适合的简笔画风格
   - 按重要性排序特征

请严格按照以下JSON格式返回分析结果：

{
  "dominant_features": {
    "primary": "主要特征描述",
    "secondary": ["次要特征1", "次要特征2", "次要特征3"],
    "unique_traits": ["独特特征1", "独特特征2"]
  },
  "geometric_shapes": {
    "face_shape": {
      "base_shape": "circle|oval|square|triangle|diamond|rectangle",
      "proportions": "wide|narrow|standard",
      "jawline": "sharp|soft|strong|delicate"
    },
    "eyes": {
      "shape": "round|almond|narrow|wide|droopy|upturned",
      "size": "large|medium|small",
      "spacing": "close|normal|wide",
      "expression": "表情描述"
    },
    "nose": {
      "shape": "straight|curved|button|hooked|wide|narrow",
      "size": "prominent|medium|small",
      "bridge": "high|low|straight"
    },
    "mouth": {
      "shape": "full|thin|wide|small|curved",
      "expression": "neutral|smiling|serious|pouty"
    },
    "eyebrows": {
      "shape": "straight|arched|thick|thin|angled",
      "position": "high|normal|low"
    }
  },
  "proportions": {
    "face_length_to_width": 数值,
    "eye_position": 数值,
    "nose_length": 数值,
    "mouth_position": 数值
  },
  "sketch_guidance": {
    "drawing_order": ["步骤1", "步骤2", "步骤3", "步骤4"],
    "key_lines": ["关键线条1", "关键线条2", "关键线条3"],
    "emphasis_points": ["强调点1", "强调点2"],
    "simplification_tips": ["简化技巧1", "简化技巧2"]
  },
  "style_recommendations": {
    "cartoon_style": "realistic|cute|exaggerated|minimalist",
    "line_weight": "thin|medium|thick|varied",
    "detail_level": "minimal|moderate|detailed"
  },
  "feature_priority": {
    "most_important": "最重要特征",
    "secondary_features": ["次重要特征1", "次重要特征2"],
    "optional_features": ["可选特征1", "可选特征2"]
  }
}

重要：请只返回JSON格式的结果，不要包含其他文字说明。`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("OpenAI分析失败");
    }

    // 尝试解析JSON响应
    let analysisResult: CaricatureAnalysis;
    try {
      // 提取JSON部分
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]) as CaricatureAnalysis;
      } else {
        throw new Error("未找到有效的JSON响应");
      }
    } catch (parseError) {
      console.error("JSON解析错误:", parseError);
      throw new Error("分析结果格式错误，请重试");
    }

    return NextResponse.json<APIResponse<CaricatureAnalysis>>({
      success: true,
      data: analysisResult,
      message: "简笔画角色分析完成",
    });
  } catch (error) {
    console.error("简笔画分析时出错:", error);

    return NextResponse.json<APIResponse>({
      success: false,
      error:
        error instanceof Error ? error.message : "简笔画分析时出现未知错误",
    });
  }
}
