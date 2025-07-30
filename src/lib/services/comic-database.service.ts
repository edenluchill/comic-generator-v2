import { supabaseAdmin } from "@/lib/supabase/server";
import { Character } from "@/types/characters";
import {
  Diary,
  Comic,
  ComicScene,
  SceneDescription,
  SceneCharacter,
  ComicFormat,
  LayoutMode,
} from "@/types/diary";

export class ComicDatabaseService {
  /**
   * 验证角色属于用户（可选，用于安全验证）
   */
  async validateUserCharacters(
    userId: string,
    characterIds: string[]
  ): Promise<boolean> {
    const { data: characters, error } = await supabaseAdmin
      .from("characters")
      .select("id")
      .in("id", characterIds)
      .eq("user_id", userId);

    if (error) {
      console.error("验证角色失败:", error);
      return false;
    }

    return characters && characters.length === characterIds.length;
  }

  /**
   * 创建日记记录
   */
  async createDiary(
    userId: string,
    content: string,
    title?: string
  ): Promise<Diary> {
    const { data: diary, error } = await supabaseAdmin
      .from("diary")
      .insert([
        {
          user_id: userId,
          content: content,
          title: title,
          status: "processing",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("创建日记失败:", error);
      throw new Error("保存日记失败");
    }

    return diary;
  }

  /**
   * 创建漫画记录
   */
  async createComic(
    diaryId: string,
    userId: string,
    style: string,
    format: ComicFormat = "four", // 新增参数
    layoutMode?: LayoutMode, // 新增参数
    title?: string
  ): Promise<Comic> {
    const { data: comic, error } = await supabaseAdmin
      .from("comic")
      .insert([
        {
          diary_id: diaryId,
          user_id: userId,
          title: title || `漫画 - ${new Date().toLocaleDateString()}`,
          style: style,
          format: format, // 新增字段
          layout_mode: layoutMode, // 新增字段
          status: "processing",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("创建漫画失败:", error);
      throw new Error("创建漫画失败");
    }

    return comic;
  }

  /**
   * 创建场景记录
   */
  async createScenes(
    comicId: string,
    sceneDescriptions: SceneDescription[],
    characters: Character[]
  ): Promise<ComicScene[]> {
    const sceneInserts = sceneDescriptions.map((scene, index) => {
      // 根据character_ids获取完整的角色信息
      const sceneCharacters: SceneCharacter[] = characters
        .filter((c) => scene.character_ids.includes(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          avatar_url: c.avatar_url,
        }));

      return {
        comic_id: comicId,
        scene_order: index + 1,
        scenario_description: scene.description,
        mood: scene.mood,
        characters: sceneCharacters,
        status: "pending" as const,
      };
    });

    const { data: scenes, error } = await supabaseAdmin
      .from("comic_scene")
      .insert(sceneInserts)
      .select();

    if (error) {
      console.error("创建场景失败:", error);
      throw new Error("创建场景失败");
    }

    return scenes;
  }

  /**
   * 更新场景状态
   */
  async updateSceneStatus(
    sceneId: string,
    status: "pending" | "processing" | "completed" | "failed" | "retry"
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from("comic_scene")
      .update({ status })
      .eq("id", sceneId);

    if (error) {
      console.error("更新场景状态失败:", error);
      throw new Error("更新场景状态失败");
    }
  }

  /**
   * 更新场景图片信息
   */
  async updateSceneImage(
    sceneId: string,
    imageUrl: string,
    imagePrompt: string,
    newDescription?: string
  ): Promise<ComicScene> {
    const updateData: Partial<ComicScene> = {
      image_url: imageUrl,
      image_prompt: imagePrompt,
      status: "completed",
    };

    // 如果提供了新的描述，也更新它
    if (newDescription) {
      updateData.scenario_description = newDescription;
    }

    const { data: updatedScene, error } = await supabaseAdmin
      .from("comic_scene")
      .update(updateData)
      .eq("id", sceneId)
      .select()
      .single();

    if (error) {
      console.error("更新场景图片失败:", error);
      throw new Error("更新场景图片失败");
    }

    return updatedScene;
  }

  /**
   * 标记场景为失败状态
   */
  async markSceneFailed(
    sceneId: string,
    retryCount: number = 0
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from("comic_scene")
      .update({
        status: "failed",
        retry_count: retryCount + 1,
      })
      .eq("id", sceneId);

    if (error) {
      console.error("标记场景失败状态失败:", error);
    }
  }

  /**
   * 完成漫画生成
   */
  async completeComic(comicId: string, diaryId: string): Promise<void> {
    await Promise.all([
      supabaseAdmin
        .from("comic")
        .update({ status: "completed" })
        .eq("id", comicId),
      supabaseAdmin
        .from("diary")
        .update({ status: "completed" })
        .eq("id", diaryId),
    ]);
  }

  /**
   * 标记漫画生成失败
   */
  async markComicFailed(comicId: string, diaryId: string): Promise<void> {
    await Promise.all([
      supabaseAdmin
        .from("comic")
        .update({ status: "failed" })
        .eq("id", comicId),
      supabaseAdmin
        .from("diary")
        .update({ status: "failed" })
        .eq("id", diaryId),
    ]);
  }

  /**
   * 获取场景信息（用于重试）
   */
  async getSceneForRetry(
    sceneId: string,
    userId: string
  ): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scene: any;
    characters: SceneCharacter[];
    style: string;
  }> {
    const { data: scene, error } = await supabaseAdmin
      .from("comic_scene")
      .select(
        `
        *,
        comic!inner(user_id, style)
      `
      )
      .eq("id", sceneId)
      .eq("comic.user_id", userId)
      .single();

    if (error || !scene) {
      throw new Error("场景不存在或无权访问");
    }

    return {
      scene,
      characters: scene.characters as SceneCharacter[],
      style: scene.comic.style,
    };
  }

  /**
   * 更新场景重试计数
   */
  async updateSceneRetryCount(
    sceneId: string,
    retryCount: number
  ): Promise<void> {
    await supabaseAdmin
      .from("comic_scene")
      .update({
        status: "processing",
        retry_count: retryCount + 1,
      })
      .eq("id", sceneId);
  }
}

// 创建单例实例
export const comicDatabaseService = new ComicDatabaseService();
