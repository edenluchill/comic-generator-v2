import { z } from "zod";
import { ComicScene } from "./diary";
import { InferUITool, UIMessage } from "ai";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { createComicGenerationTool } from "@/lib/ai/tools/generate-comic";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// 定义消息部分的具体类型
export interface TextPart {
  type: "text";
  text: string;
}

export interface FilePart {
  type: "file";
  mediaType: string;
  url: string;
  filename?: string;
}

export interface ImagePart {
  type: "image";
  url: string;
  alt?: string;
}

export interface ReasoningPart {
  type: "reasoning";
  text: string;
}

export type MessagePart = TextPart | FilePart | ImagePart | ReasoningPart;

type weatherTool = InferUITool<typeof getWeather>;
type comicGenerationTool = InferUITool<
  ReturnType<typeof createComicGenerationTool>
>;

export type ChatTools = {
  getWeather: weatherTool;
  generateComic: comicGenerationTool;
};

export type CustomUIDataTypes = {
  imageDelta: string;
  suggestion: unknown;
  appendMessage: string;
  id: string;
  title: string;
  kind: string;
  clear: null;
  finish: null;
  // 漫画生成相关事件 - 使用实际的事件名称
  "event-comic-start": {
    message: string;
  };
  "event-comic-progress": {
    type: string;
    step?: string;
    message: string;
    progress: number;
    currentScene?: number;
    totalScenes?: number;
  };
  "event-comic-created": {
    comic: ComicArtifact;
  };
  "event-scene-created": {
    scene: ComicScene;
  };
  "event-scene-updated": {
    scene: ComicScene;
  };
  "event-scene-image-generated": {
    sceneId: string;
    imageUrl: string;
  };
  "event-comic-finish": {
    comic: ComicArtifact;
    scenes: ComicScene[];
    result: unknown;
  };
  "event-comic-error": {
    error: string;
  };
};

// 基础 ChatMessage 类型来自 AI SDK
export type BaseChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

// 扩展 ChatMessage 类型以包含可选的 artifacts
export type ChatMessage = BaseChatMessage & {
  artifacts?: ArtifactType[];
};

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

// Artifact 相关类型
export interface ComicArtifact {
  type: "comic";
  title: string;
  scenes: ComicScene[];
}

export type ArtifactType = ComicArtifact;

// 聊天界面相关的类型
export interface ChatInterfaceProps {
  title?: string;
  systemPrompt?: string;
  className?: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onShowArtifact?: (artifact: ArtifactType) => void;
}

export interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}
