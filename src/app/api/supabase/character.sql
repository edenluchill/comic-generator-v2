-- 创建characters表
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  three_view_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的角色
CREATE POLICY "Users can only access their own characters" ON characters
  USING (auth.uid() = user_id);

-- 创建策略：用户可以插入自己的角色
CREATE POLICY "Users can insert their own characters" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户可以更新自己的角色
CREATE POLICY "Users can update their own characters" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的角色
CREATE POLICY "Users can delete their own characters" ON characters
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE
    ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();