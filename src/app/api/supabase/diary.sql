CREATE TABLE diary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- 可选的日记标题
  content TEXT NOT NULL, -- 原始日记内容
  mood TEXT, -- 情绪标签 (happy, sad, excited, etc.)
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- 日记日期
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);