"use client";

import { useState, useRef, KeyboardEvent } from "react";
import {
  Send,
  Paperclip,
  TestTube,
  Palette,
  RotateCcw,
  Settings,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageUpload from "./ImageUpload";
import type { Attachment, ChatMessage, MessagePart } from "@/types/chat";
import { UseChatHelpers } from "@ai-sdk/react";

interface ChatInputProps {
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onToggleTestComic?: () => void;
  isTestComicVisible?: boolean;
}

export default function ChatInput({
  sendMessage,
  disabled = false,
  placeholder = "Type your message...",
  isLoading = false,
  onToggleTestComic,
  isTestComicVisible = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if ((!message.trim() && images.length === 0) || disabled) return;

    try {
      const content = message.trim();
      const parts: MessagePart[] = [{ type: "text" as const, text: content }];

      // Convert File objects to attachments if needed
      if (images.length > 0) {
        const attachments = await Promise.all(
          images.map(async (file) => {
            const url = URL.createObjectURL(file);
            return {
              contentType: file.type,
              url,
            } as Attachment;
          })
        );

        attachments.forEach((attachment) => {
          if (attachment.contentType.startsWith("image/")) {
            parts.push({
              type: "file" as const,
              mediaType: attachment.contentType,
              url: attachment.url,
            });
          }
        });
      }

      sendMessage({
        role: "user",
        parts: [
          ...images.map((image) => ({
            type: "file" as const,
            url: URL.createObjectURL(image),
            name: image.name,
            mediaType: image.type,
          })),
          {
            type: "text",
            text: content,
          },
        ],
      });

      // Reset form
      setMessage("");
      setImages([]);
      setShowImageUpload(false);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 支持 Shift+Enter 换行，Enter 发送
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 200; // 增加最大高度以支持更多行
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="p-6">
      {/* Image Upload Section */}
      {showImageUpload && (
        <div className="mb-4 p-4 rounded-lg border border-foreground/20 bg-background/50 backdrop-blur-sm">
          <ImageUpload
            onImagesChange={setImages}
            maxImages={4}
            disabled={disabled}
          />
        </div>
      )}

      {/* Main Input Container - 上下布局 */}
      <div
        className={cn(
          "rounded-2xl border-2 border-foreground/30 bg-background/50 backdrop-blur-sm transition-all duration-200",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          "shadow-lg"
        )}
      >
        {/* Input Row */}
        <div className="flex items-end gap-3 p-4">
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground/70",
              "focus:outline-none focus:ring-0 min-h-[24px] max-h-[200px] leading-6",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />

          {/* Send Button */}
          <Button
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && images.length === 0)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              onClick={() => setShowImageUpload(!showImageUpload)}
              disabled={disabled}
              title="上传图片"
            >
              <Paperclip
                className={cn(
                  "w-4 h-4 transition-colors",
                  showImageUpload ? "text-primary" : "text-muted-foreground"
                )}
              />
            </Button>

            {onToggleTestComic && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/50"
                onClick={onToggleTestComic}
                title={isTestComicVisible ? "隐藏测试漫画" : "显示测试漫画"}
              >
                <TestTube
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isTestComicVisible
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              title="样式设置"
            >
              <Palette className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              title="语音输入"
            >
              <Mic className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              onClick={() => window.location.reload()}
              disabled={isLoading}
              title="重置对话"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50"
              title="设置"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
