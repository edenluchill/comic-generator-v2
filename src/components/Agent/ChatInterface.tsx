"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings } from "lucide-react";
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

export default function ChatInterface({
  title = "AI Chat Assistant",
  className,
}: ChatInterfaceProps) {
  const { setDataStream } = useDataStream();
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    // onFinish: () => {
    //   mutate(unstable_serialize(getChatHistoryPaginationKey));
    // },
    // onError: (error) => {
    //   if (error instanceof ChatSDKError) {
    //     toast({
    //       type: 'error',
    //       description: error.message,
    //     });
    //   }
    // },
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

  const isLoading = status === "streaming";

  // console.log("messages: ", messages);

  return (
    <>
      <Card className={`flex flex-col h-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "AI is thinking..." : "Ready to chat"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <Messages
          messages={messages as ChatMessageType[]}
          status={status}
          onShowArtifact={handleShowArtifact}
        />

        {/* Input */}
        <ChatInput
          sendMessage={sendMessage}
          disabled={isLoading}
          placeholder="Ask me anything..."
        />
      </Card>

      {/* Comic Artifact */}
      {currentArtifact && (
        <ComicArtifact
          title={currentArtifact.title}
          scenes={currentArtifact.scenes}
          isVisible={isArtifactVisible}
          onClose={handleCloseArtifact}
        />
      )}
    </>
  );
}
