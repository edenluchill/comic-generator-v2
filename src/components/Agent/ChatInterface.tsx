"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Messages } from "./Messages";
import ChatInput from "./ChatInput";
import ComicArtifact from "./ComicArtifact";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ChatInterfaceProps,
  ChatMessage,
  ChatMessage as ChatMessageType,
  ComicArtifact as ComicArtifactType,
} from "@/types/chat";
import { DefaultChatTransport } from "ai";
import { fetchWithErrorHandlers } from "@/lib/message-util";
import { useDataStream } from "../providers/data-stream-provider";

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { setDataStream } = useDataStream();
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
  });

  const [currentArtifact, setCurrentArtifact] =
    useState<ComicArtifactType | null>(null);
  const [isArtifactVisible, setIsArtifactVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // 初始化
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowArtifact = (artifact: ComicArtifactType) => {
    setCurrentArtifact(artifact);
    setIsArtifactVisible(true);
  };

  const handleCloseArtifact = () => {
    setIsArtifactVisible(false);
  };

  // 当动画完成后清除artifact
  const handleAnimationComplete = () => {
    if (!isArtifactVisible) {
      setCurrentArtifact(null);
    }
  };

  // 测试函数：切换漫画显示
  const handleToggleTestComic = () => {
    if (isArtifactVisible) {
      handleCloseArtifact();
    } else {
      // 创建测试漫画数据
      const testArtifact: ComicArtifactType = {
        type: "comic",
        title: "测试漫画 - The Great Mug Migration",
        scenes: [
          {
            id: "scene-1",
            comic_id: "test-comic",
            scene_order: 1,
            content: "Amelia坐在宿舍里，周围散落着各种脏杯子",
            scenario_description: "Amelia坐在宿舍里，周围散落着各种脏杯子",
            quote: "又是这些杯子...",
            image_url: "/samples/1.png",
            status: "completed",
            retry_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "scene-2",
            comic_id: "test-comic",
            scene_order: 2,
            content: "Amelia开始收集所有的杯子",
            scenario_description: "Amelia开始收集所有的杯子",
            quote: "是时候来一次大清理了！",
            image_url: "/samples/2.png",
            status: "completed",
            retry_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "scene-3",
            comic_id: "test-comic",
            scene_order: 3,
            content: "Amelia在厨房认真清洗杯子",
            scenario_description: "Amelia在厨房认真清洗杯子",
            quote: "一个一个慢慢洗干净",
            image_url: "/samples/3.png",
            status: "completed",
            retry_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
      handleShowArtifact(testArtifact);
    }
  };

  const isLoading = status === "streaming";

  // 计算布局模式
  const minChatWidth = 360;
  const minArtifactWidth = 612;
  const totalMinWidth = minChatWidth + minArtifactWidth;

  // 是否应该只显示漫画（空间不足时）
  const shouldShowOnlyArtifact =
    isArtifactVisible && windowWidth > 0 && windowWidth < totalMinWidth;

  // 聊天界面宽度（当显示漫画时为33%，但不少于360px）
  const chatWidth =
    isArtifactVisible && !shouldShowOnlyArtifact
      ? Math.max(minChatWidth, windowWidth * 0.33)
      : windowWidth > 0
      ? Math.min(windowWidth, 896)
      : 896; // 最大宽度限制

  // 计算居中的 margin 值
  const calculateCenterMargin = () => {
    if (isArtifactVisible || windowWidth <= 896) {
      return 0;
    }
    // 当没有漫画显示且窗口足够宽时，计算居中所需的 margin
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
        {/* 去掉Card包装，直接使用透明背景 */}
        <div
          className={`grid grid-rows-[1fr_auto] h-full w-full gap-4 ${className} `}
        >
          {/* Messages - 透明背景 */}
          <div className="min-h-0 overflow-hidden">
            <Messages
              messages={messages as ChatMessageType[]}
              status={status}
              onShowArtifact={handleShowArtifact}
            />
          </div>

          {/* Input区域 - 包含所有action buttons */}
          <div className="flex-shrink-0">
            <ChatInput
              sendMessage={sendMessage}
              disabled={isLoading}
              placeholder="Ask me anything about comic creation..."
              isLoading={isLoading}
              onToggleTestComic={handleToggleTestComic}
              isTestComicVisible={isArtifactVisible}
            />
          </div>
        </div>
      </motion.div>

      {/* 漫画展示区域 */}
      <AnimatePresence onExitComplete={handleAnimationComplete}>
        {currentArtifact && isArtifactVisible && (
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
              title={currentArtifact.title}
              scenes={currentArtifact.scenes}
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
