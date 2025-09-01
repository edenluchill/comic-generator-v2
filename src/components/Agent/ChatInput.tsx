"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageUpload from "./ImageUpload";
import type { Attachment, ChatMessage, MessagePart } from "@/types/chat";
import { UseChatHelpers } from "@ai-sdk/react";

interface ChatInputProps {
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  sendMessage,
  disabled = false,
  placeholder = "Type your message...",
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

      // await sendMessage({
      //   role: "user",
      //   text: content,
      //   parts,
      //   metadata: {
      //     createdAt: new Date().toISOString(),
      //   },
      // });

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 120; // max-height equivalent
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      {/* Image Upload Section */}
      {showImageUpload && (
        <div className="p-4 border-b border-border">
          <ImageUpload
            onImagesChange={setImages}
            maxImages={4}
            disabled={disabled}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-all duration-200",
            "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
          )}
        >
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={disabled}
          >
            <Paperclip
              className={cn(
                "w-4 h-4 transition-colors",
                showImageUpload ? "text-primary" : "text-muted-foreground"
              )}
            />
          </Button>

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
              "flex-1 resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-0 min-h-[20px] max-h-[120px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />

          {/* Send Button */}
          <Button
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && images.length === 0)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Status indicators */}
        {images.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} attached
          </div>
        )}
      </div>
    </div>
  );
}
