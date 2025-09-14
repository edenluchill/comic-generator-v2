"use client";

import { cn } from "@/lib/utils";
import { Bot, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import equal from "fast-deep-equal";
import type { ChatMessageProps, ChatMessage, ArtifactType } from "@/types/chat";
import { Image as ImageIcon, Play } from "lucide-react";
import { useDataStream } from "../providers/data-stream-provider";
import { StreamResponse } from "./StreamResponse";

const PureChatMessage = ({
  message,
  isStreaming = false,
  onShowArtifact,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  useDataStream();

  const handleCopy = async () => {
    const content = getTextContent(message);
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  // 从 message.parts 提取文本内容
  const getTextContent = (message: ChatMessage): string => {
    if (!message.parts || !Array.isArray(message.parts)) {
      return "";
    }

    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          part.type === "text" && "text" in part
      )
      .map((part) => part.text)
      .join("");
  };

  // 从 message.parts 提取文件附件
  const getFileAttachments = (message: ChatMessage) => {
    if (!message.parts || !Array.isArray(message.parts)) {
      return [];
    }

    return message.parts.filter(
      (
        part
      ): part is {
        type: "file";
        mediaType: string;
        url: string;
        filename?: string;
      } =>
        part.type === "file" &&
        "mediaType" in part &&
        "url" in part &&
        typeof part.mediaType === "string" &&
        typeof part.url === "string" &&
        part.mediaType.startsWith("image/")
    );
  };

  const content = getTextContent(message);
  const attachments = getFileAttachments(message);
  const { role } = message;

  const renderArtifacts = () => {
    let artifacts: ArtifactType[] = [];

    // 首先检查 message 是否有 artifacts 属性
    if (
      "artifacts" in message &&
      message.artifacts &&
      message.artifacts.length > 0
    ) {
      artifacts = [...message.artifacts];
    }

    // 检查工具调用结果中是否有漫画数据
    const messageWithTools = message as ChatMessage & {
      toolInvocations?: Array<{
        toolName: string;
        state: string;
        result?: {
          comic?: ArtifactType;
          message: string;
          status: string;
        };
      }>;
    };

    if (message.role === "assistant" && messageWithTools.toolInvocations) {
      for (const toolInvocation of messageWithTools.toolInvocations) {
        if (
          toolInvocation.toolName === "generateComic" &&
          toolInvocation.state === "result" &&
          toolInvocation.result?.comic
        ) {
          artifacts.push(toolInvocation.result.comic);
        }
      }
    }

    if (artifacts.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        {artifacts.map((artifact: ArtifactType, index: number) => (
          <div key={index}>
            {artifact.type === "comic" && (
              <Button
                variant="outline"
                onClick={() => onShowArtifact?.(artifact)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                查看漫画: {artifact.title}
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${role}`}
        className="mx-auto w-full max-w-4xl group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={role}
      >
        <div
          className={cn(
            "flex gap-4 w-full transition-all duration-300",
            role === "user" ? "ml-auto max-w-3xl justify-end" : "justify-start"
          )}
        >
          {/* Content Container */}
          <div className="flex flex-col gap-3 w-full min-w-0">
            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div
                data-testid="message-attachments"
                className={cn(
                  "flex flex-wrap gap-2",
                  role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-lg overflow-hidden border border-border shadow-sm"
                  >
                    <Image
                      src={attachment.url}
                      alt={attachment.filename || `Uploaded image ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Message Content */}
            <div className="flex flex-row gap-2 items-start">
              {/* Text Content */}
              {content && (
                <div
                  data-testid="message-content"
                  className={cn(
                    "relative rounded-lg px-4 py-3 max-w-none transition-all duration-200",
                    role === "user"
                      ? "bg-primary text-primary-foreground ml-auto order-1"
                      : "bg-muted/50 text-foreground",
                    isStreaming && "animate-pulse"
                  )}
                >
                  {role === "assistant" ? (
                    <StreamResponse className="prose prose-sm max-w-none dark:prose-invert">
                      {sanitizeText(content)}
                    </StreamResponse>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap break-words">
                        {sanitizeText(content)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions - only for assistant messages */}
            {role === "assistant" && content && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs hover:bg-muted"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Artifacts */}
            {renderArtifacts()}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Memoized component with proper comparison
export const Message = memo(PureChatMessage, (prevProps, nextProps) => {
  // 如果是流式状态，总是重新渲染以确保内容更新
  if (nextProps.isStreaming || prevProps.isStreaming) {
    return false;
  }

  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});

// Thinking/Loading message component
export const ThinkingMessage = () => {
  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="mx-auto w-full max-w-4xl group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
      data-role="assistant"
    >
      <div className="flex gap-4 w-full justify-start">
        <div className="flex justify-center items-center rounded-full ring-1 size-8 shrink-0 ring-border bg-background">
          <div className="translate-y-px">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="bg-muted/50 rounded-lg px-4 py-3 text-muted-foreground">
            <motion.div
              className="flex items-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Thinking
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
              >
                .
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}
