"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { ComicScene } from "@/types/diary";
import { ComicHeader } from "./ComicHeader";
import { ComicViewer } from "./ComicViewer";
import { SceneInfo } from "./SceneInfo";
import { SceneThumbnails } from "./SceneThumbnails";

interface ComicArtifactProps {
  title: string;
  scenes: ComicScene[];
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  isSidePanel?: boolean;
  showOnlyArtifact?: boolean;
}

export default function ComicArtifact({
  title,
  scenes,
  isVisible,
  onClose,
  className = "",
  isSidePanel = false,
  showOnlyArtifact = false,
}: ComicArtifactProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentScene = scenes[currentSceneIndex];
  const totalScenes = scenes.length;

  const handlePrevScene = () => {
    setCurrentSceneIndex((prev) => (prev > 0 ? prev - 1 : totalScenes - 1));
  };

  const handleNextScene = () => {
    setCurrentSceneIndex((prev) => (prev < totalScenes - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    if (currentScene?.image_url) {
      const link = document.createElement("a");
      link.href = currentScene.image_url;
      link.download = `${title}-scene-${currentSceneIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isVisible || scenes.length === 0) return null;

  // 侧边面板模式
  if (isSidePanel) {
    return (
      <div className={`h-full ${className}`}>
        <Card className="h-full flex flex-col bg-background border-l md:border-l-0">
          <ComicHeader
            title={title}
            currentSceneIndex={currentSceneIndex}
            totalScenes={totalScenes}
            showOnlyArtifact={showOnlyArtifact}
            onClose={onClose}
            onDownload={handleDownload}
            canDownload={!!currentScene?.image_url}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <ComicViewer
              scene={currentScene}
              title={title}
              currentSceneIndex={currentSceneIndex}
              totalScenes={totalScenes}
              onPrevScene={handlePrevScene}
              onNextScene={handleNextScene}
            />

            <SceneInfo scene={currentScene} />

            <SceneThumbnails
              scenes={scenes}
              currentSceneIndex={currentSceneIndex}
              onSceneSelect={setCurrentSceneIndex}
            />
          </div>
        </Card>
      </div>
    );
  }

  // 全屏模态模式
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`fixed inset-4 md:inset-8 ${className}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="h-full flex flex-col bg-background/95 backdrop-blur-sm">
            <ComicHeader
              title={title}
              currentSceneIndex={currentSceneIndex}
              totalScenes={totalScenes}
              onClose={onClose}
              onDownload={handleDownload}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              canDownload={!!currentScene?.image_url}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <ComicViewer
                scene={currentScene}
                title={title}
                currentSceneIndex={currentSceneIndex}
                totalScenes={totalScenes}
                onPrevScene={handlePrevScene}
                onNextScene={handleNextScene}
              />

              <SceneInfo scene={currentScene} />

              <SceneThumbnails
                scenes={scenes}
                currentSceneIndex={currentSceneIndex}
                onSceneSelect={setCurrentSceneIndex}
              />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
