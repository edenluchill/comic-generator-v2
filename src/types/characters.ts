export interface Character {
  id: string;
  name: string;
  avatar_url: string;
  three_view_url: string;
  created_at: string;
  user_id: string;
}

export interface CreateCharacterData {
  name: string;
  avatarUrl: string;
  threeViewUrl: string;
}

export interface UpdateCharacterData {
  name?: string;
  avatar_url?: string;
  three_view_url?: string;
}
