import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  threeViewUrl: string;
  createdAt: string;
}

export interface CharactersState {
  characters: Character[];
}

const initialState: CharactersState = {
  characters: [],
};

export const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    // 添加新角色
    addCharacter: (state, action: PayloadAction<Character>) => {
      state.characters.push(action.payload);
    },

    // 删除角色
    removeCharacter: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter(
        (character) => character.id !== action.payload
      );
    },

    // 更新角色信息
    updateCharacter: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<Character, "id">>;
      }>
    ) => {
      const index = state.characters.findIndex(
        (character) => character.id === action.payload.id
      );
      if (index !== -1) {
        state.characters[index] = {
          ...state.characters[index],
          ...action.payload.updates,
        };
      }
    },

    // 清空所有角色
    clearCharacters: (state) => {
      state.characters = [];
    },
  },
});

export const {
  addCharacter,
  removeCharacter,
  updateCharacter,
  clearCharacters,
} = charactersSlice.actions;

export default charactersSlice.reducer;
