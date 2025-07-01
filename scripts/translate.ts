import { protos, TranslationServiceClient } from "@google-cloud/translate";
import fs from "fs";

// Google Cloud 配置
const GOOGLE_CLOUD_PROJECT_ID = "realtorgpt";
const GOOGLE_APPLICATION_CREDENTIALS = "./scripts/realtorgpt-1b19e38a5857.json";

// 初始化翻译客户端
const translationClient = new TranslationServiceClient({
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
});

// 语言映射配置 - 适配你现有的语言
const LANGUAGE_MAPPINGS = {
  zh: "zh-CN", // 中文简体
  ja: "ja", // 日语
  ko: "ko", // 韩语
} as const;

// 文件路径配置
const MESSAGES_DIR = "./messages";
const SOURCE_FILE = `${MESSAGES_DIR}/en.json`;
const CACHE_FILE = `${MESSAGES_DIR}/en.cache.json`;

interface TranslationMap {
  [key: string]: string | TranslationMap;
}

/**
 * 主翻译函数
 */
async function translateMessages(): Promise<void> {
  try {
    console.log("🚀 开始翻译流程...");

    // 读取英文源文件
    const sourceData = readJsonFile(SOURCE_FILE);
    if (!sourceData) {
      console.error("❌ 无法读取英文源文件");
      return;
    }

    // 读取缓存并检测变化
    const cachedData = readJsonFile(CACHE_FILE) || {};
    const changedKeys = findChangedKeys(sourceData, cachedData);

    if (changedKeys.length === 0) {
      console.log("✅ 没有检测到变化，跳过翻译");
      return;
    }

    console.log(`📝 检测到 ${changedKeys.length} 个变化的键，开始翻译...`);
    console.log("变化的键:", changedKeys);

    // 记录翻译成功的语言
    const successfulLanguages: string[] = [];
    let allTranslationsSuccessful = true;

    // 为每种语言生成翻译
    for (const [langCode, googleLangCode] of Object.entries(
      LANGUAGE_MAPPINGS
    )) {
      try {
        await translateLanguage(
          sourceData,
          langCode,
          googleLangCode,
          changedKeys
        );
        successfulLanguages.push(langCode);
      } catch (error) {
        console.error(`❌ 翻译 ${langCode} 时发生错误:`, error);
        allTranslationsSuccessful = false;
        // 继续尝试其他语言的翻译
      }
    }

    // 只有当所有语言都成功翻译时，才更新缓存
    if (
      allTranslationsSuccessful &&
      successfulLanguages.length === Object.keys(LANGUAGE_MAPPINGS).length
    ) {
      writeJsonFile(CACHE_FILE, sourceData);
      console.log("🎉 所有语言翻译完成，缓存已更新！");
    } else {
      console.warn("⚠️  部分语言翻译失败，缓存未更新");
      console.log(`成功翻译的语言: ${successfulLanguages.join(", ")}`);
      console.log("请修复错误后重新运行翻译脚本");
    }
  } catch (error) {
    console.error("❌ 翻译过程中发生错误:", error);
  }
}

/**
 * 翻译单个语言
 */
async function translateLanguage(
  sourceData: TranslationMap,
  langCode: string,
  googleLangCode: string,
  changedKeys: string[]
): Promise<void> {
  console.log(`🌐 正在翻译 ${langCode}...`);

  const targetFile = `${MESSAGES_DIR}/${langCode}.json`;
  const existingTranslations = readJsonFile(targetFile) || {};

  try {
    const translatedData = await translateObject(
      sourceData,
      googleLangCode,
      existingTranslations,
      changedKeys
    );

    writeJsonFile(targetFile, translatedData);
    console.log(`✅ ${langCode}.json 翻译完成`);
  } catch (error) {
    console.error(`❌ 翻译 ${langCode} 失败:`, error);
    throw error; // 重新抛出错误，让上层处理
  }
}

/**
 * 翻译对象（递归处理嵌套结构）
 */
async function translateObject(
  obj: TranslationMap,
  targetLanguage: string,
  existingData: TranslationMap = {},
  changedKeys: string[],
  currentPath = ""
): Promise<TranslationMap> {
  const result = { ...existingData };

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;

    if (typeof value === "string") {
      // 只翻译变化的键或不存在的键
      if (shouldTranslateKey(fullPath, changedKeys) || !existingData[key]) {
        result[key] = await translateText(value, targetLanguage);
      }
    } else if (typeof value === "object" && value !== null) {
      // 直接传递原始的 changedKeys，不要处理成相对路径
      result[key] = await translateObject(
        value as TranslationMap,
        targetLanguage,
        existingData[key] as TranslationMap,
        changedKeys, // ← 直接传递完整路径的 changedKeys
        fullPath
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 翻译单个文本
 */
async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    // 保护特殊占位符（如果有的话）
    const protectedText = protectPlaceholders(text);

    const request: protos.google.cloud.translation.v3.ITranslateTextRequest = {
      parent: `projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
      contents: [protectedText],
      mimeType: "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);
    let translatedText = response.translations?.[0]?.translatedText || text;

    // 恢复占位符
    translatedText = restorePlaceholders(translatedText);

    return translatedText;
  } catch (error) {
    console.error(`翻译错误 (${targetLanguage}):`, error);
    return text; // 翻译失败时返回原文
  }
}

/**
 * 检测变化的键
 */
function findChangedKeys(
  newData: TranslationMap,
  oldData: TranslationMap,
  prefix = ""
): string[] {
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(newData)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      if (value !== oldData[key]) {
        changedKeys.push(fullKey);
      }
    } else if (typeof value === "object" && value !== null) {
      const oldValue = typeof oldData[key] === "object" ? oldData[key] : {};
      changedKeys.push(...findChangedKeys(value, oldValue, fullKey));
    }
  }

  return changedKeys;
}

/**
 * 检查是否应该翻译某个键
 */
function shouldTranslateKey(fullPath: string, changedKeys: string[]): boolean {
  return changedKeys.some(
    (key) =>
      key === fullPath ||
      key.startsWith(`${fullPath}.`) ||
      fullPath.startsWith(`${key}.`)
  );
}

/**
 * 保护占位符（防止翻译破坏格式）
 */
function protectPlaceholders(text: string): string {
  // 保护常见的占位符模式，比如 {{variable}}, {0}, %s 等
  return text
    .replace(
      /\{\{[^}]+\}\}/g,
      (match) =>
        `__PLACEHOLDER_${Buffer.from(match).toString("base64")}_PLACEHOLDER__`
    )
    .replace(
      /\{[0-9]+\}/g,
      (match) =>
        `__PLACEHOLDER_${Buffer.from(match).toString("base64")}_PLACEHOLDER__`
    );
}

/**
 * 恢复占位符
 */
function restorePlaceholders(translatedText: string): string {
  const placeholderRegex = /__PLACEHOLDER_([A-Za-z0-9+/=]+)_PLACEHOLDER__/g;

  return translatedText.replace(placeholderRegex, (match, base64) => {
    try {
      return Buffer.from(base64, "base64").toString("utf8");
    } catch {
      return match;
    }
  });
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filePath: string): TranslationMap | null {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error);
  }
  return null;
}

/**
 * 写入 JSON 文件
 */
function writeJsonFile(filePath: string, data: TranslationMap): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`写入文件失败 ${filePath}:`, error);
  }
}

// 执行翻译
if (require.main === module) {
  translateMessages();
}

export { translateMessages };
