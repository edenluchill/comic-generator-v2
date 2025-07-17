import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Character {
  id: string;
  name: string;
  avatar_url: string;
  three_view_url: string;
  created_at: string;
  user_id: string;
}

export interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: string | null;
}

const initialState: CharactersState = {
  characters: [],
  loading: false,
  error: null,
};

// 异步操作：获取角色列表
export const fetchCharacters = createAsyncThunk(
  "characters/fetchCharacters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/characters");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取角色失败");
      }

      return data.characters;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "未知错误"
      );
    }
  }
);

// 异步操作：创建角色
export const createCharacter = createAsyncThunk(
  "characters/createCharacter",
  async (
    characterData: {
      name: string;
      avatarUrl: string;
      threeViewUrl: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(characterData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "创建角色失败");
      }

      return data.character;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "未知错误"
      );
    }
  }
);

// 异步操作：更新角色
export const updateCharacterAsync = createAsyncThunk(
  "characters/updateCharacter",
  async (
    {
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Character, "id" | "user_id" | "created_at">>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新角色失败");
      }

      return data.character;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "未知错误"
      );
    }
  }
);

// 异步操作：删除角色
export const deleteCharacter = createAsyncThunk(
  "characters/deleteCharacter",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除角色失败");
      }

      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "未知错误"
      );
    }
  }
);

export const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },

    // 清空所有角色（用于退出登录）
    clearCharacters: (state) => {
      state.characters = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取角色列表
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 创建角色
      .addCase(createCharacter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.characters.unshift(action.payload);
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 更新角色
      .addCase(updateCharacterAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCharacterAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.characters.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.characters[index] = action.payload;
        }
      })
      .addCase(updateCharacterAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 删除角色
      .addCase(deleteCharacter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = state.characters.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCharacters } = charactersSlice.actions;

export default charactersSlice.reducer;
