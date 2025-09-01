"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Messages } from "./Messages";
import ChatInput from "./ChatInput";
import ComicArtifact from "./ComicArtifact";
import type {
  ChatInterfaceProps,
  ChatMessage,
  ChatMessage as ChatMessageType,
  ComicArtifact as ComicArtifactType,
} from "@/types/chat";
import { DefaultChatTransport } from "ai";
import { fetchWithErrorHandlers } from "@/lib/message-util";
import { useDataStream } from "../providers/data-stream-provider";

export default function MobileChatInterface({ className }: ChatInterfaceProps) {
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

  const handleShowArtifact = (artifact: ComicArtifactType) => {
    setCurrentArtifact(artifact);
    setIsArtifactVisible(true);
  };

  const handleCloseArtifact = () => {
    setIsArtifactVisible(false);
    setCurrentArtifact(null);
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

  // 如果显示漫画，就只显示漫画
  if (currentArtifact && isArtifactVisible) {
    return (
      <div className="h-full w-full">
        <ComicArtifact
          title={currentArtifact.title}
          scenes={currentArtifact.scenes}
          isVisible={isArtifactVisible}
          onClose={handleCloseArtifact}
          isSidePanel={false}
          showOnlyArtifact={true}
        />
      </div>
    );
  }

  // 否则只显示聊天界面
  return (
    <div
      className={`grid grid-rows-[1fr_auto] h-full w-full gap-0 ${className}`}
    >
      {/* Messages */}
      <div className="min-h-0 overflow-hidden">
        <Messages
          messages={messages as ChatMessageType[]}
          status={status}
          onShowArtifact={handleShowArtifact}
        />
      </div>

      {/* Input区域 */}
      <div className="flex-shrink-0 p-4 pt-0">
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
  );
}
