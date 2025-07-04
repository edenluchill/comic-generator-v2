"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_status: "free" | "premium";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usage_stats?: any;
}

// Global auth cache at module level
let globalAuthCache: {
  user: User | null;
  profile: UserProfile | null;
  timestamp: number;
} | null = null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getLocalizedHref } = useLocalizedNavigation();

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // 首先检查全局缓存
        if (globalAuthCache && Date.now() - globalAuthCache.timestamp < 10000) {
          setUser(globalAuthCache.user);
          setProfile(globalAuthCache.profile);
          setLoading(false);
          return;
        }

        // 然后检查 sessionStorage
        const cachedSession = sessionStorage.getItem("auth_session");
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (Date.now() - parsed.timestamp < 30000) {
            // 增加到30秒
            setUser(parsed.user);
            setProfile(parsed.profile);
            setLoading(false);

            // 更新全局缓存
            globalAuthCache = {
              user: parsed.user,
              profile: parsed.profile,
              timestamp: Date.now(),
            };
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            const profileData = {
              id: session.user.id,
              email: session.user.email!,
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
              subscription_status: "free" as const,
              usage_stats: {
                images_generated: 0,
                stories_created: 0,
              },
            };
            setProfile(profileData);

            // 缓存认证状态
            sessionStorage.setItem(
              "auth_session",
              JSON.stringify({
                user: session.user,
                profile: profileData,
                timestamp: Date.now(),
              })
            );

            // 更新全局缓存
            globalAuthCache = {
              user: session.user,
              profile: profileData,
              timestamp: Date.now(),
            };
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        // 模拟获取用户配置文件
        setProfile({
          id: session.user.id,
          email: session.user.email!,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
          subscription_status: "free",
          usage_stats: {
            images_generated: 0,
            stories_created: 0,
          },
        });

        // 更新全局缓存
        globalAuthCache = {
          user: session.user,
          profile: {
            id: session.user.id,
            email: session.user.email!,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            subscription_status: "free",
            usage_stats: {
              images_generated: 0,
              stories_created: 0,
            },
          },
          timestamp: Date.now(),
        };
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        globalAuthCache = null; // 清除全局缓存
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [getLocalizedHref]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${getLocalizedHref(
            "/auth/callback"
          )}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${getLocalizedHref(
            "/auth/callback"
          )}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async (email: string, token: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    verifyEmailCode,
    signOut,
  };
}
