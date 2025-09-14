import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Comic, ComicScene } from "@/types/diary";

interface ComicProgress {
  isGenerating: boolean;
  progress: number;
  message: string;
  currentScene?: number;
  totalScenes?: number;
  step?: string;
}

interface ComicState {
  currentComic: Comic | null;
  scenes: ComicScene[];
  progress: ComicProgress;
  error: string | null;
}

const initialState: ComicState = {
  currentComic: null,
  scenes: [],
  progress: {
    isGenerating: false,
    progress: 0,
    message: "",
  },
  error: null,
};

const comicSlice = createSlice({
  name: "comic",
  initialState,
  reducers: {
    // 开始生成漫画
    startComicGeneration: (
      state,
      action: PayloadAction<{ message: string }>
    ) => {
      state.progress.isGenerating = true;
      state.progress.progress = 0;
      state.progress.message = action.payload.message;
      state.error = null;
    },

    // 更新进度
    updateProgress: (
      state,
      action: PayloadAction<{
        progress: number;
        message: string;
        step?: string;
        currentScene?: number;
        totalScenes?: number;
      }>
    ) => {
      state.progress.progress = action.payload.progress;
      state.progress.message = action.payload.message;
      if (action.payload.step) state.progress.step = action.payload.step;
      if (action.payload.currentScene)
        state.progress.currentScene = action.payload.currentScene;
      if (action.payload.totalScenes)
        state.progress.totalScenes = action.payload.totalScenes;
    },

    // 设置漫画数据
    setComic: (state, action: PayloadAction<Comic>) => {
      state.currentComic = action.payload;
    },

    // 更新场景
    updateScenes: (state, action: PayloadAction<ComicScene[]>) => {
      state.scenes = action.payload;
      // 同时更新漫画中的场景
      if (state.currentComic) {
        state.currentComic.scenes = action.payload;
      }
    },

    // 添加单个场景
    addScene: (state, action: PayloadAction<ComicScene>) => {
      const existingIndex = state.scenes.findIndex(
        (s) => s.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.scenes[existingIndex] = action.payload;
      } else {
        state.scenes.push(action.payload);
        // 按scene_order排序
        state.scenes.sort((a, b) => a.scene_order - b.scene_order);
      }

      // 同时更新漫画中的场景
      if (state.currentComic) {
        state.currentComic.scenes = [...state.scenes];
      }
    },

    // 更新单个场景
    updateScene: (
      state,
      action: PayloadAction<Partial<ComicScene> & { id: string }>
    ) => {
      const index = state.scenes.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.scenes[index] = { ...state.scenes[index], ...action.payload };

        // 同时更新漫画中的场景
        if (state.currentComic) {
          state.currentComic.scenes = [...state.scenes];
        }
      }
    },

    // 完成生成
    completeGeneration: (
      state,
      action: PayloadAction<{ comic: Comic; scenes: ComicScene[] }>
    ) => {
      state.progress.isGenerating = false;
      state.progress.progress = 100;
      state.progress.message = "漫画生成完成！";
      state.currentComic = action.payload.comic;
      state.scenes = action.payload.scenes;
      state.error = null;
    },

    // 生成失败
    failGeneration: (state, action: PayloadAction<{ error: string }>) => {
      state.progress.isGenerating = false;
      state.progress.message = "生成失败";
      state.error = action.payload.error;
    },

    // 重置进度
    resetProgress: (state) => {
      state.progress = {
        isGenerating: false,
        progress: 0,
        message: "",
      };
    },

    // 清除漫画
    clearComic: (state) => {
      state.currentComic = null;
      state.scenes = [];
      state.progress = {
        isGenerating: false,
        progress: 0,
        message: "",
      };
      state.error = null;
    },
  },
});

export const {
  startComicGeneration,
  updateProgress,
  setComic,
  updateScenes,
  addScene,
  updateScene,
  completeGeneration,
  failGeneration,
  resetProgress,
  clearComic,
} = comicSlice.actions;

export default comicSlice.reducer;
