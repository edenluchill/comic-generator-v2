"use client";

import ChatInterface from "@/components/Agent/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] w-full bg-theme-gradient">
      <div className="h-full w-full p-8">
        <ChatInterface
          systemPrompt="You are a helpful assistant specialized in comic generation and creative storytelling. You can analyze images, help create engaging stories, develop characters, and provide creative suggestions for comic creation. Be creative, supportive, and provide detailed feedback."
          className="h-full"
        />
      </div>
    </div>
  );
}
