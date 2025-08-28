import { supabaseAdmin } from "@/lib/supabase/server";
import { Comic, ComicScene, SceneDescription } from "@/types/diary";

export class ComicDatabaseService {
  /**
   * 创建新的comic记录
   */
  async createComic(params: {
    userId: string;
    title?: string;
    content: string; // 直接存储内容，不再依赖diary
    mood?: string;
    style: string;
  }): Promise<string> {
    const { userId, title, content, mood, style } = params;

    const { data, error } = await supabaseAdmin
      .from("comic")
      .insert({
        user_id: userId,
        title,
        content,
        mood,
        style,
        scene_ids: [], // 初始化为空数组
        status: "processing",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`创建漫画记录失败: ${error.message}`);
    }

    return data.id;
  }

  /**
   * 向comic的scene_ids数组中添加新场景
   */
  async addSceneToComic(comicId: string, sceneId: string): Promise<void> {
    // 先获取当前的scene_ids
    const { data: comic, error: fetchError } = await supabaseAdmin
      .from("comic")
      .select("scene_ids")
      .eq("id", comicId)
      .single();

    if (fetchError) {
      throw new Error(`获取漫画信息失败: ${fetchError.message}`);
    }

    const currentSceneIds = comic.scene_ids || [];
    const updatedSceneIds = [...currentSceneIds, sceneId];

    // 更新scene_ids数组
    const { error: updateError } = await supabaseAdmin
      .from("comic")
      .update({
        scene_ids: updatedSceneIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comicId);

    if (updateError) {
      throw new Error(`更新漫画场景列表失败: ${updateError.message}`);
    }
  }

  /**
   * 获取comic及其所有场景
   */
  async getComicWithScenes(comicId: string): Promise<Comic | null> {
    const { data: comic, error } = await supabaseAdmin
      .from("comic")
      .select(
        `
        *,
        scenes:comic_scene(*)
      `
      )
      .eq("id", comicId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`获取漫画失败: ${error.message}`);
    }

    // 按照scene_ids的顺序排列场景
    if (comic.scenes && comic.scene_ids) {
      const orderedScenes = comic.scene_ids
        .map((sceneId: string) =>
          comic.scenes.find((scene: ComicScene) => scene.id === sceneId)
        )
        .filter(Boolean);
      comic.scenes = orderedScenes;
    }

    return comic;
  }

  /**
   * 创建多个场景记录
   */
  async createScenes(
    comicId: string,
    sceneDescriptions: SceneDescription[]
  ): Promise<ComicScene[]> {
    const sceneInserts = sceneDescriptions.map((scene, index) => {
      return {
        comic_id: comicId,
        scene_order: index + 1,
        content: "", // 可以根据需要设置内容
        scenario_description: scene.description,
        mood: scene.mood,
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
   * 创建单个场景记录
   */
  async createScene(params: {
    comicId: string;
    sceneOrder: number;
    content: string;
    description: string;
    mood?: string;
    quote?: string;
    imageUrl?: string;
    imagePrompt?: string;
  }): Promise<ComicScene> {
    const {
      comicId,
      sceneOrder,
      content,
      description,
      mood,
      quote,
      imageUrl,
      imagePrompt,
    } = params;

    const { data: scene, error } = await supabaseAdmin
      .from("comic_scene")
      .insert({
        comic_id: comicId,
        scene_order: sceneOrder,
        content: content,
        scenario_description: description,
        mood: mood,
        quote: quote,
        image_url: imageUrl,
        image_prompt: imagePrompt,
        status: "pending" as const,
        characters: [], // 初始化为空数组
        retry_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("创建场景失败:", error);
      throw new Error("创建场景失败");
    }

    return scene;
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
  async completeComic(comicId: string): Promise<void> {
    await supabaseAdmin
      .from("comic")
      .update({ status: "completed" })
      .eq("id", comicId);
  }

  /**
   * 标记漫画生成失败
   */
  async markComicFailed(comicId: string): Promise<void> {
    await supabaseAdmin
      .from("comic")
      .update({ status: "failed" })
      .eq("id", comicId);
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

  /**
   * 获取用户的所有漫画
   */
  async getUserComics(userId: string): Promise<Comic[]> {
    const { data: comics, error } = await supabaseAdmin
      .from("comic")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`获取用户漫画失败: ${error.message}`);
    }

    return comics || [];
  }

  /**
   * 删除漫画及其所有场景
   */
  async deleteComic(comicId: string, userId: string): Promise<void> {
    // 验证用户权限
    const { data: comic, error: fetchError } = await supabaseAdmin
      .from("comic")
      .select("user_id")
      .eq("id", comicId)
      .single();

    if (fetchError || !comic) {
      throw new Error("漫画不存在");
    }

    if (comic.user_id !== userId) {
      throw new Error("无权删除此漫画");
    }

    // 删除漫画（场景会通过外键级联删除）
    const { error: deleteError } = await supabaseAdmin
      .from("comic")
      .delete()
      .eq("id", comicId);

    if (deleteError) {
      throw new Error(`删除漫画失败: ${deleteError.message}`);
    }
  }
}

// 创建单例实例
export const comicDatabaseService = new ComicDatabaseService();
