"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Messages } from "./Messages";
import ChatInput from "./ChatInput";
import ComicArtifact from "./ComicArtifact";
import { ComicStatusDisplay } from "./ComicStatusDisplay";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ChatInterfaceProps,
  ChatMessage,
  ChatMessage as ChatMessageType,
} from "@/types/chat";
import { DefaultChatTransport } from "ai";
import { useDataStream } from "../providers/data-stream-provider";
import { makeAuthenticatedRequest } from "@/lib/auth-request";
import { useAppSelector } from "@/store/hooks";

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { setDataStream } = useDataStream();
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      credentials: "include",
      fetch: makeAuthenticatedRequest,
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
  });

  // 从Redux store获取漫画状态
  const { currentComic, scenes, progress } = useAppSelector(
    (state) => state.comic
  );

  const [isArtifactVisible, setIsArtifactVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 监听Redux中的漫画状态变化，自动显示漫画
  useEffect(() => {
    if (currentComic && scenes.length > 0 && !progress.isGenerating) {
      setIsArtifactVisible(true);
    }
  }, [currentComic, scenes, progress.isGenerating]);

  const handleCloseArtifact = () => {
    setIsArtifactVisible(false);
  };

  const isLoading = status === "streaming";

  // 计算布局
  const minChatWidth = 360;
  const minArtifactWidth = 612;
  const totalMinWidth = minChatWidth + minArtifactWidth;

  const shouldShowOnlyArtifact =
    isArtifactVisible && windowWidth > 0 && windowWidth < totalMinWidth;

  const chatWidth =
    isArtifactVisible && !shouldShowOnlyArtifact
      ? Math.max(minChatWidth, windowWidth * 0.33)
      : windowWidth > 0
      ? Math.min(windowWidth, 896)
      : 896;

  const calculateCenterMargin = () => {
    if (isArtifactVisible || windowWidth <= 896) {
      return 0;
    }
    const actualChatWidth = typeof chatWidth === "number" ? chatWidth : 896;
    return Math.max(0, (windowWidth - actualChatWidth) / 2);
  };

  const centerMargin = calculateCenterMargin();

  return (
    <div className="flex h-full w-full gap-8 min-h-0">
      {/* 聊天界面 */}
      <motion.div
        className={`flex-shrink-0 min-h-0 ${
          shouldShowOnlyArtifact ? "hidden" : ""
        }`}
        initial={false}
        animate={{
          width: typeof chatWidth === "number" ? `${chatWidth}px` : chatWidth,
          marginLeft: centerMargin,
          marginRight: centerMargin,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          duration: 0.6,
        }}
        layout
      >
        <div
          className={`grid grid-rows-[1fr_auto] h-full w-full gap-4 ${className} `}
        >
          {/* Messages */}
          <div className="min-h-0 overflow-hidden">
            {/* 漫画生成状态显示 */}
            <ComicStatusDisplay />

            <Messages
              messages={messages as ChatMessageType[]}
              status={status}
              onShowArtifact={() => {}}
            />
          </div>

          {/* Input区域 */}
          <div className="flex-shrink-0">
            <ChatInput
              sendMessage={sendMessage}
              disabled={isLoading}
              placeholder="Ask me anything about comic creation..."
              isLoading={isLoading}
              onToggleTestComic={() => setIsArtifactVisible(!isArtifactVisible)}
              isTestComicVisible={isArtifactVisible}
            />
          </div>
        </div>
      </motion.div>

      {/* 漫画展示区域 */}
      <AnimatePresence>
        {isArtifactVisible && (
          <motion.div
            className="flex-1 min-w-0 min-h-0"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.6,
            }}
            layout
          >
            <ComicArtifact
              title={currentComic?.title || "未命名漫画"}
              scenes={scenes}
              isVisible={isArtifactVisible}
              onClose={handleCloseArtifact}
              isSidePanel={true}
              showOnlyArtifact={shouldShowOnlyArtifact}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
