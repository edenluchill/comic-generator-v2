CREATE TABLE comic_scene (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comic_id UUID REFERENCES comic(id) ON DELETE CASCADE,
  scene_order INTEGER NOT NULL, -- 场景顺序 (1-4)
  content TEXT NOT NULL, -- 原始日记内容
  scenario_description TEXT NOT NULL, -- ChatGPT生成的英文场景描述
  mood TEXT, -- 场景情绪
  quote TEXT, -- 装逼话/哲理名言
  image_url TEXT, -- 生成的图片URL
  image_prompt TEXT, -- 用于生成图片的完整prompt
  characters JSONB DEFAULT '[]', -- TODO: 保留 后面可以加简短的相关的 关联的角色信息
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comic_id, scene_order)
);
