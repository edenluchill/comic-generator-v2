
-- 启用行级安全策略
ALTER TABLE comic_scene ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能通过comic表访问自己的场景
CREATE POLICY "Users can only access their own comic scenes" ON comic_scene
  USING (
    EXISTS (
      SELECT 1 FROM comic 
      WHERE comic.id = comic_scene.comic_id 
      AND comic.user_id = auth.uid()
    )
  );

-- 创建策略：用户可以插入自己的场景
CREATE POLICY "Users can insert their own comic scenes" ON comic_scene
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM comic 
      WHERE comic.id = comic_scene.comic_id 
      AND comic.user_id = auth.uid()
    )
  );

-- 创建策略：用户可以更新自己的场景
CREATE POLICY "Users can update their own comic scenes" ON comic_scene
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM comic 
      WHERE comic.id = comic_scene.comic_id 
      AND comic.user_id = auth.uid()
    )
  );

-- 创建策略：用户可以删除自己的场景
CREATE POLICY "Users can delete their own comic scenes" ON comic_scene
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM comic 
      WHERE comic.id = comic_scene.comic_id 
      AND comic.user_id = auth.uid()
    )
  );

-- 创建索引
CREATE INDEX idx_comic_scene_comic_id ON comic_scene(comic_id, scene_order);
CREATE INDEX idx_comic_scene_status ON comic_scene(status);

-- 创建更新时间的触发器
CREATE TRIGGER update_comic_scene_updated_at BEFORE UPDATE
    ON comic_scene FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为comic表添加RLS策略
ALTER TABLE comic ENABLE ROW LEVEL SECURITY;

-- comic表的策略
CREATE POLICY "Users can only access their own comics" ON comic
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comics" ON comic
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comics" ON comic
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comics" ON comic
  FOR DELETE USING (auth.uid() = user_id);

-- 为comic表创建更新时间的触发器
CREATE TRIGGER update_comic_updated_at BEFORE UPDATE
    ON comic FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引
CREATE INDEX idx_comic_user_id ON comic(user_id);