"use client";

import { useEffect, useRef } from "react";
import { useDataStream } from "./data-stream-provider";
import { useAppDispatch } from "@/store/hooks";
import {
  startComicGeneration,
  updateProgress,
  setComic,
  addScene,
  updateScene,
  completeGeneration,
  failGeneration,
} from "@/store/slices/comicSlice";
import type { Comic } from "@/types/diary";
import type { CustomUIDataTypes } from "@/types/chat";

export function ComicStreamHandler() {
  const { dataStream } = useDataStream();
  const dispatch = useAppDispatch();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    newDeltas.forEach((delta) => {
      console.log("🔄 处理数据流事件:", delta.type, delta.data);

      switch (delta.type) {
        case "data-event-comic-start":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-comic-start"];
            dispatch(
              startComicGeneration({
                message: data.message || "开始生成漫画...",
              })
            );
          }
          break;

        case "data-event-comic-progress":
          if (delta.data) {
            const progressData =
              delta.data as CustomUIDataTypes["event-comic-progress"];
            dispatch(
              updateProgress({
                progress: progressData.progress,
                message: progressData.message,
                step: progressData.step,
                currentScene: progressData.currentScene,
                totalScenes: progressData.totalScenes,
              })
            );
          }
          break;

        case "data-event-comic-created":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-comic-created"];
            if (data.comic) {
              // 将ComicArtifact转换为Comic类型
              const comic: Comic = {
                id: `comic-${Date.now()}`, // 临时ID，应该从服务器获取
                user_id: "", // 应该从上下文获取
                title: data.comic.title,
                content: "", // 应该从原始故事获取
                date: new Date().toISOString(),
                style: "cute", // 默认值，应该从参数获取
                scene_ids: data.comic.scenes.map((s) => s.id),
                status: "processing",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                scenes: data.comic.scenes,
              };
              dispatch(setComic(comic));
            }
          }
          break;

        case "data-event-scene-created":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-scene-created"];
            if (data.scene) {
              dispatch(addScene(data.scene));
            }
          }
          break;

        case "data-event-scene-updated":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-scene-updated"];
            if (data.scene) {
              dispatch(updateScene(data.scene));
            }
          }
          break;

        case "data-event-scene-image-generated":
          if (delta.data) {
            const data =
              delta.data as CustomUIDataTypes["event-scene-image-generated"];
            if (data.sceneId && data.imageUrl) {
              dispatch(
                updateScene({
                  id: data.sceneId,
                  image_url: data.imageUrl,
                  status: "completed",
                })
              );
            }
          }
          break;

        case "data-event-comic-finish":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-comic-finish"];
            if (data.comic && data.scenes) {
              // 将ComicArtifact转换为Comic类型
              const comic: Comic = {
                id: `comic-${Date.now()}`, // 临时ID，应该从服务器获取
                user_id: "", // 应该从上下文获取
                title: data.comic.title,
                content: "", // 应该从原始故事获取
                date: new Date().toISOString(),
                style: "cute", // 默认值，应该从参数获取
                scene_ids: data.scenes.map((s) => s.id),
                status: "completed",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                scenes: data.scenes,
              };
              dispatch(completeGeneration({ comic, scenes: data.scenes }));
            }
          }
          break;

        case "data-event-comic-error":
          if (delta.data) {
            const data = delta.data as CustomUIDataTypes["event-comic-error"];
            dispatch(
              failGeneration({
                error: data.error || "生成过程中发生错误",
              })
            );
          }
          break;

        default:
          // 忽略其他类型的事件
          break;
      }
    });
  }, [dataStream, dispatch]);

  return null;
}
