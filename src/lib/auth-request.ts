import { supabase } from "@/lib/supabase/client";

/**
 * 发送需要认证的请求
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<Response>
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("用户未登录或token已过期");
  }

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

/**
 * 发送需要认证的JSON请求并解析响应
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<any>
 */
export async function makeAuthenticatedJsonRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await makeAuthenticatedRequest(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`请求失败: ${response.status} ${errorText}`);
  }

  return response.json();
}
