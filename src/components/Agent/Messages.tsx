"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage, ComicArtifact } from "@/types/chat";
import { Message, ThinkingMessage } from "./Message";
import { ChatStatus } from "ai";
import { Conversation, ConversationContent } from "./elements/conversation";

interface MessagesProps {
  messages: ChatMessage[];
  status: ChatStatus;
  onShowArtifact?: (artifact: ComicArtifact) => void;
}

export function Messages({ messages, status, onShowArtifact }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //   useDataStream();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 space-y-4 overflow-y-auto">
      <Conversation className="flex flex-col min-w-0 gap-6 pt-4 pb-32">
        <ConversationContent className="flex flex-col gap-6 overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Message
                  message={message}
                  isStreaming={
                    status === "streaming" && index === messages.length - 1
                  }
                  onShowArtifact={onShowArtifact}
                />
              </motion.div>
            ))}

            {status === "submitted" &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <ThinkingMessage />
              )}
          </AnimatePresence>
        </ConversationContent>
      </Conversation>

      {status === "streaming" && messages.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
