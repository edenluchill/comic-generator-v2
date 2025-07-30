CREATE TABLE comic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id UUID REFERENCES diary(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- 漫画标题
  style TEXT DEFAULT 'cute' CHECK (style IN ('cute', 'realistic', 'minimal', 'kawaii')),
  format TEXT DEFAULT 'four' CHECK (format IN ('single', 'four')), -- 新增格式字段
  layout_mode TEXT CHECK (layout_mode IN ('grid-2x2', 'vertical-strip', 'horizontal-strip', 'comic-book', 'poster')), -- 新增排版模式字段，默认null
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);