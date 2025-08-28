CREATE TABLE comic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- 漫画标题
  content TEXT NOT NULL, -- 原始内容（直接存储，不再依赖diary）
  mood TEXT, -- 情绪标签 (happy, sad, excited, etc.)
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- 创建日期
  style TEXT DEFAULT 'cute',
  scene_ids UUID[] DEFAULT '{}', -- 存储comic_scene的id数组，按顺序排列
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);