"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { ChatStatus } from "ai";

interface UseMessagesProps {
  chatId?: string;
  status: ChatStatus;
}

export function useMessages({ status }: UseMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasSentMessage, setHasSentMessage] = useState(false);

  // 检测是否已发送消息
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      setHasSentMessage(true);
    }
  }, [status]);

  // 自动滚动到底部
  useEffect(() => {
    if (isAtBottom && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAtBottom, status]);

  const onViewportEnter = useCallback(() => {
    setIsAtBottom(true);
  }, []);

  const onViewportLeave = useCallback(() => {
    setIsAtBottom(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(atBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    containerRef,
    endRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    isAtBottom,
    scrollToBottom,
  };
}
