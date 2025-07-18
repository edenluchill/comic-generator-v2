import { Character } from "@/types/characters";
import { SceneCharacter } from "@/types/diary";

export interface PromptProcessingOptions {
  sceneDescription: string;
  characters: SceneCharacter[];
  style: string;
}

export interface ProcessedPrompt {
  originalPrompt: string;
  processedPrompt: string;
  characterMappings: Array<{
    originalName: string;
    positionLabel: string;
    character: SceneCharacter;
  }>;
}

export class PromptProcessingService {
  /**
   * 处理场景描述中的角色名字
   */
  processScenePrompt(options: PromptProcessingOptions): ProcessedPrompt {
    const { sceneDescription, characters } = options;

    // 生成角色位置映射
    const characterMappings = this.generateCharacterMappings(characters);

    // 替换角色名字
    let processedDescription = sceneDescription;

    for (const mapping of characterMappings) {
      const namePattern = new RegExp(`<${mapping.originalName}>`, "g");
      processedDescription = processedDescription.replace(
        namePattern,
        mapping.positionLabel
      );
    }

    return {
      originalPrompt: sceneDescription,
      processedPrompt: processedDescription,
      characterMappings,
    };
  }

  /**
   * 生成角色位置映射
   */
  private generateCharacterMappings(characters: SceneCharacter[]): Array<{
    originalName: string;
    positionLabel: string;
    character: SceneCharacter;
  }> {
    return characters.map((character, index) => ({
      originalName: character.name,
      positionLabel: this.getPositionLabel(index, characters.length),
      character,
    }));
  }

  /**
   * 根据索引和总数生成位置标签
   */
  private getPositionLabel(index: number, total: number): string {
    if (total === 1) return "character";
    if (index === 0) return "left character";
    if (index === total - 1) return "right character";
    return "middle character";
  }

  /**
   * 验证prompt中是否包含角色名字标记
   */
  validatePrompt(prompt: string, characters: Character[]): boolean {
    const characterNames = characters.map((c) => c.name);

    for (const name of characterNames) {
      const pattern = new RegExp(`<${name}>`, "g");
      if (pattern.test(prompt)) {
        return true;
      }
    }

    return characterNames.length === 0; // 如果没有角色，也是有效的
  }

  /**
   * 提取prompt中的角色名字
   */
  extractCharacterNames(prompt: string): string[] {
    const namePattern = /<([^>]+)>/g;
    const matches = [];
    let match;

    while ((match = namePattern.exec(prompt)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }
}

// 创建单例实例
export const promptProcessingService = new PromptProcessingService();
