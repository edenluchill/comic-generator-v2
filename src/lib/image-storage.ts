import { supabaseAdmin } from "./supabase/server";

/**
 * 从 URL 下载图片并上传到 Supabase Storage
 */
export async function downloadAndStoreImage(
  imageUrl: string,
  bucket: string,
  folder: string,
  filename?: string
): Promise<string> {
  try {
    // 1. 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    // 2. 生成文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = contentType.includes("jpeg") ? "jpg" : "png";
    const finalFilename = filename || `${timestamp}_${randomId}.${extension}`;
    const filePath = `${folder}/${finalFilename}`;

    // 3. 上传到 Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, imageBuffer, {
        contentType,
        upsert: false,
      });

    if (!data) {
      throw new Error("Data is undefined, Failed to upload image");
    }

    if (uploadError != null) {
      throw new Error(`Failed to upload image: ${uploadError}`);
    }

    // 4. 获取公共 URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error storing image:", error);
    throw error;
  }
}

/**
 * 存储 Flux 生成的角色图片
 */
export async function storeFluxCharacterImages(
  avatarUrl: string,
  threeViewUrl: string,
  userId?: string
): Promise<{
  storedAvatarUrl: string;
  storedThreeViewUrl: string;
}> {
  const bucket = "generated-images";
  const userFolder = userId ? `users/${userId}` : "anonymous";
  const timestamp = Date.now();

  try {
    // 并行上传两张图片
    const [storedAvatarUrl, storedThreeViewUrl] = await Promise.all([
      downloadAndStoreImage(
        avatarUrl,
        bucket,
        `${userFolder}/avatars`,
        `avatar_${timestamp}.png`
      ),
      downloadAndStoreImage(
        threeViewUrl,
        bucket,
        `${userFolder}/three-views`,
        `three_view_${timestamp}.png`
      ),
    ]);

    return {
      storedAvatarUrl,
      storedThreeViewUrl,
    };
  } catch (error) {
    console.error("Error storing character images:", error);
    throw error;
  }
}

/**
 * 删除存储的图片
 */
export async function deleteStoredImage(
  imageUrl: string,
  bucket: string
): Promise<void> {
  try {
    // 从 URL 中提取文件路径
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split("/");
    const bucketIndex = pathSegments.findIndex((segment) => segment === bucket);
    if (bucketIndex === -1) {
      throw new Error("Invalid image URL");
    }

    const filePath = pathSegments.slice(bucketIndex + 1).join("/");

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
