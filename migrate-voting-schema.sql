-- Migration script to create voting automation tables
-- Run this against your PostgreSQL database before deploying the new services

-- Create voting_automations table
CREATE TABLE IF NOT EXISTS voting_automations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  mode TEXT NOT NULL CHECK (mode IN ('target', 'absolute')),
  direction TEXT CHECK (direction IN ('up', 'down')),
  requested_votes INTEGER,
  target_score INTEGER,
  account TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'processing', 'stopped', 'completed', 'failed')),
  votes_applied INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 100,
  retry_count INTEGER DEFAULT 0,
  last_claimed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create action_log table for audit trail
CREATE TABLE IF NOT EXISTS actions_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  automation_id TEXT REFERENCES voting_automations(id) ON DELETE CASCADE,
  account TEXT,
  target_id TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('up', 'down')),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate_limits table for account management
CREATE TABLE IF NOT EXISTS rate_limits (
  account TEXT PRIMARY KEY,
  password TEXT,
  client_id TEXT,
  client_secret TEXT,
  tokens_remaining INTEGER DEFAULT 60,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  backoff_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_automations_target ON voting_automations(target_id);
CREATE INDEX IF NOT EXISTS idx_voting_automations_status ON voting_automations(status);
CREATE INDEX IF NOT EXISTS idx_voting_automations_updated ON voting_automations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_voting_automations_priority ON voting_automations(priority ASC);
CREATE INDEX IF NOT EXISTS idx_actions_log_automation ON actions_log(automation_id);
CREATE INDEX IF NOT EXISTS idx_actions_log_attempted ON actions_log(attempted_at DESC);

-- Insert default rate limit accounts (update with your actual credentials)
INSERT INTO rate_limits (account, password, client_id, client_secret) VALUES
('No_Big2686', '68@/x:2Ma5E<', 'w5SmJH9HYWNvvA0qsa25wA', 'ICUBiYBRwHRxzdvcvG0Iv-yOAhJYVg'),
('Total_Leather7876', 'M81,M<B''1N*q', 'alW-ONqKrmggr21Pd9i75A', 'hBG6y-BpiuR4xwYg3ZBsPTjreJhD7g'),
('Historical_Air_9261', '9Y,4e4(ZrZY*', '053x14gupmmSWZa4d6N8xg', '6PxYp-B5Dj2ZY5Lvh0gEibO8rrwEIg'),
('Rough-Argument2736', '29.x|=Rm@M6l', 'zVxr1FPUEVAoYAqJZbOWhw', 'kadO1VasbncIWmbuiGOcsqov6dEtVg')
ON CONFLICT (account) DO UPDATE SET
  password = EXCLUDED.password,
  client_id = EXCLUDED.client_id,
  client_secret = EXCLUDED.client_secret;

-- Verify the schema
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('voting_automations', 'actions_log', 'rate_limits')
ORDER BY tablename;
