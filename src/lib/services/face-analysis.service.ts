import OpenAI from "openai";

export interface CaricatureAnalysis {
  tags: string[];
}

export interface FaceAnalysisOptions {
  maxTokens?: number;
  temperature?: number;
}

const openai = new OpenAI({
  apiKey: process.env.MYOPENAI_API_KEY,
});

export class FaceAnalysisService {
  /**
   * 分析图片并提取角色特征标签
   */
  async analyzeFace(
    imageFile: File,
    options: FaceAnalysisOptions = {}
  ): Promise<string[]> {
    const { maxTokens = 500, temperature = 0.3 } = options;

    // 将图片转换为base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${imageFile.type};base64,${buffer.toString(
      "base64"
    )}`;

    // 使用OpenAI Vision API进行标签识别
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify character attributes and features for creating a simple sketch/line drawing.

Please identify character features using underscore-connected keywords. Focus on distinctive traits suitable for simple drawings:

- Character types: "young_girl", "old_man", "little_boy", "teenage_girl", etc.
- Facial features: "big_eyes", "small_nose", "round_face", "square_jaw", "thick_eyebrows", "dimples", etc.
- Hairstyles: "long_hair", "short_hair", "curly_hair", "straight_hair", "ponytail", "twin_tails", "pigtails", "messy_hair", "bald", "bob_cut", "pixie_cut", "braids", "bun", "side_part", "bangs", "wavy_hair", "afro", "dreadlocks", "mohawk", etc.
- Expressions: "big_smile", "serious_face", "surprised_look", "sleepy_eyes", "angry_brows", etc.
- Accessories: "round_glasses", "baseball_cap", "bow_tie", "earrings", "headband", etc.
- Clothing style: "casual_shirt", "formal_suit", "school_uniform", "hoodie", "dress", etc.
- Body type: "tall_build", "short_build", "slim_figure", "chubby_cheeks", etc.
- Animals (if present): "cute_cat", "small_dog", "pet_bird", etc.
- Unique characteristics: "freckles", "scar", "tattoo", "birthmark", etc.

Use simple, clear keywords connected with underscores that would help an artist create a recognizable sketch. Focus on the most distinctive and easily drawable features.

Return only JSON format:
{
  "tags": ["tag1", "tag2", "tag3", ...]
}

Return only JSON, no other text.`,
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
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("OpenAI分析失败");
    }

    // 解析JSON响应
    let analysisResult: CaricatureAnalysis;
    try {
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

    return analysisResult.tags;
  }

  /**
   * 从base64图片字符串分析面部特征
   */
  async analyzeFaceFromBase64(
    base64Image: string,
    options: FaceAnalysisOptions = {}
  ): Promise<string[]> {
    const { maxTokens = 500, temperature = 0.3 } = options;

    // 使用OpenAI Vision API进行标签识别
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify character attributes and features for creating a simple sketch/line drawing.

Please identify character features using underscore-connected keywords. Focus on distinctive traits suitable for simple drawings:

- Character types: "young_girl", "old_man", "little_boy", "teenage_girl", etc.
- Facial features: "big_eyes", "small_nose", "round_face", "square_jaw", "thick_eyebrows", "dimples", etc.
- Hairstyles: "long_hair", "short_hair", "curly_hair", "straight_hair", "ponytail", "twin_tails", "pigtails", "messy_hair", "bald", "bob_cut", "pixie_cut", "braids", "bun", "side_part", "bangs", "wavy_hair", "afro", "dreadlocks", "mohawk", etc.
- Expressions: "big_smile", "serious_face", "surprised_look", "sleepy_eyes", "angry_brows", etc.
- Accessories: "round_glasses", "baseball_cap", "bow_tie", "earrings", "headband", etc.
- Clothing style: "casual_shirt", "formal_suit", "school_uniform", "hoodie", "dress", etc.
- Body type: "tall_build", "short_build", "slim_figure", "chubby_cheeks", etc.
- Animals (if present): "cute_cat", "small_dog", "pet_bird", etc.
- Unique characteristics: "freckles", "scar", "tattoo", "birthmark", etc.

Use simple, clear keywords connected with underscores that would help an artist create a recognizable sketch. Focus on the most distinctive and easily drawable features.

Return only JSON format:
{
  "tags": ["tag1", "tag2", "tag3", ...]
}

Return only JSON, no other text.`,
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
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("OpenAI分析失败");
    }

    // 解析JSON响应
    let analysisResult: CaricatureAnalysis;
    try {
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

    return analysisResult.tags;
  }
}

// 创建单例实例
export const faceAnalysisService = new FaceAnalysisService();
