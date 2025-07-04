import { createClient } from "@supabase/supabase-js";

// 服务器端客户端 - 完全权限
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 服务密钥
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 用户认证的服务器端客户端
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
