-- ===========================================
-- 专业的Credit系统数据库设计
-- ===========================================

-- 1. 用户档案表 (扩展auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  override_avatar_url TEXT,
  
  -- 订阅信息
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Credit相关
  current_credits INTEGER DEFAULT 60, -- 免费版默认60 credits
  monthly_credit_limit INTEGER DEFAULT 60, -- 每月credit限制
  credits_reset_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 month', -- 下次重置日期
  
  -- 统计信息
  total_comics_generated INTEGER DEFAULT 0,

  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Credit交易记录表
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- 交易信息
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduction', 'refill', 'monthly_reset', 'subscription_bonus')),
  amount INTEGER NOT NULL, -- 正数为增加，负数为扣减
  
  -- 关联信息
  related_entity_type TEXT, -- 'comic', 'character', 'subscription' 等
  related_entity_id UUID, -- 关联的实体ID
  
  -- 描述信息
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- 存储额外信息
  
  -- 余额快照
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 订阅计划配置表 (方便动态调整)
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL, -- 价格（分）
  currency TEXT DEFAULT 'usd',
  
  -- Credit配置
  monthly_credits INTEGER NOT NULL,
  
  -- 功能配置
  features JSONB DEFAULT '{}', -- 功能开关
  
  -- Stripe配置
  stripe_price_id TEXT NOT NULL,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 插入默认订阅计划
INSERT INTO subscription_plans (id, name, price_cents, monthly_credits, features, stripe_price_id) VALUES 
('free', 'Free Plan', 0, 60, '{"watermark": true, "quality": "720p"}', ''),
('premium', 'Premium Plan', 599, 1000, '{"watermark": false, "quality": "4k", "priority_processing": true}', 'price_premium_monthly_placeholder');

-- ===========================================
-- 索引优化
-- ===========================================

-- 用户档案索引
CREATE INDEX idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX idx_user_profiles_credits_reset_date ON user_profiles(credits_reset_date);
CREATE INDEX idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);

-- Credit交易索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_related ON credit_transactions(related_entity_type, related_entity_id);

-- ===========================================
-- 行级安全策略 (Row Level Security)
-- ===========================================

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 用户档案策略
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service can manage profiles" ON user_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Credit交易策略
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage transactions" ON credit_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 订阅计划策略（所有人可读，只有服务角色可写）
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service can manage plans" ON subscription_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ===========================================
-- 触发器和函数
-- ===========================================

-- 更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 新用户自动创建档案
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- 记录开始
  RAISE LOG 'Trigger: Creating profile for user % (email: %)', NEW.id, NEW.email;
  
  -- 尝试插入
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''), -- 确保不是 NULL
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RAISE LOG 'Trigger: Successfully created profile for user %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE LOG 'Trigger: Profile already exists for user %', NEW.id;
    RETURN NEW;
  WHEN others THEN
    RAISE LOG 'Trigger: Failed to create profile for user %: % (SQLSTATE: %)', 
              NEW.id, SQLERRM, SQLSTATE;
    -- 不阻止用户创建，但记录错误
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Credit重置函数（定期任务调用）
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  -- 重置到期用户的credits
  UPDATE user_profiles 
  SET 
    current_credits = monthly_credit_limit,
    credits_reset_date = credits_reset_date + INTERVAL '1 month'
  WHERE credits_reset_date <= CURRENT_DATE;
  
  -- 记录重置交易
  INSERT INTO credit_transactions (user_id, transaction_type, amount, description, balance_before, balance_after)
  SELECT 
    id as user_id,
    'monthly_reset' as transaction_type,
    monthly_credit_limit - current_credits as amount,
    'Monthly credit reset' as description,
    current_credits as balance_before,
    monthly_credit_limit as balance_after
  FROM user_profiles 
  WHERE credits_reset_date <= CURRENT_DATE + INTERVAL '1 month' AND credits_reset_date > CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 视图 (方便查询)
-- ===========================================

-- 用户完整信息视图
CREATE VIEW user_profiles_with_stats AS
SELECT 
  up.*,
  sp.name as plan_name,
  sp.features as plan_features,
  COUNT(ct.id) as total_transactions,
  SUM(CASE WHEN ct.transaction_type = 'deduction' THEN ABS(ct.amount) ELSE 0 END) as total_credits_spent
FROM user_profiles up
LEFT JOIN subscription_plans sp ON sp.id = up.subscription_tier
LEFT JOIN credit_transactions ct ON ct.user_id = up.id AND ct.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY up.id, sp.name, sp.features; 