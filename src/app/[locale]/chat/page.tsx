"use client";

import ChatInterface from "@/components/Agent/ChatInterface";

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <ChatInterface
          title="Comic Generation Assistant"
          systemPrompt="You are a helpful assistant specialized in comic generation and creative storytelling. You can analyze images, help create engaging stories, develop characters, and provide creative suggestions for comic creation. Be creative, supportive, and provide detailed feedback."
          className="h-full"
        />
      </div>
    </div>
  );
}
