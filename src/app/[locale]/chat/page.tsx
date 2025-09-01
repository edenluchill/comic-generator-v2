"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/Agent/ChatInterface";
import MobileChatInterface from "@/components/Agent/MobileChatInterface";

export default function ChatPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    setMounted(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 避免hydration mismatch
  if (!mounted) {
    return (
      <div className="h-[calc(100vh-theme(spacing.16))] w-full bg-theme-gradient overflow-hidden">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] w-full bg-theme-gradient overflow-hidden">
      <div className="h-full w-full grid grid-rows-[1fr] p-4 md:p-8">
        {isMobile ? (
          <MobileChatInterface className="min-h-0 overflow-hidden" />
        ) : (
          <ChatInterface className="min-h-0 overflow-hidden" />
        )}
      </div>
    </div>
  );
}
