-- Create AIConversation and AISuggestion tables (Option A shape)

CREATE TABLE IF NOT EXISTS "AIConversation" (
  "id" text PRIMARY KEY,
  "projectId" text NULL REFERENCES "Project"("id") ON DELETE SET NULL,
  "userId" text NOT NULL,
  "messages" json NOT NULL DEFAULT '[]',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AIConversation_projectId_idx" ON "AIConversation" ("projectId");
CREATE INDEX IF NOT EXISTS "AIConversation_userId_idx" ON "AIConversation" ("userId");

CREATE TABLE IF NOT EXISTS "AISuggestion" (
  "id" text PRIMARY KEY,
  "conversationId" text NOT NULL REFERENCES "AIConversation"("id") ON DELETE CASCADE,
  "projectId" text NULL REFERENCES "Project"("id") ON DELETE SET NULL,
  -- legacy presentation fields
  "rank" int NOT NULL DEFAULT 0,
  "title" text NOT NULL,
  "description" text NULL,
  "priority" text NOT NULL DEFAULT 'medium',
  "labels" text[] NOT NULL DEFAULT '{}',
  "dependencies" text[] NOT NULL DEFAULT '{}',
  "meta" json NOT NULL DEFAULT '{}',
  -- new planning fields
  "type" text NOT NULL DEFAULT 'plan_task',
  "data" json NOT NULL DEFAULT '{}',
  "userId" text NOT NULL,
  "confidence" double precision NULL,
  "rationale" text NULL,
  -- lifecycle
  "status" text NOT NULL DEFAULT 'pending',
  "hash" text NOT NULL DEFAULT '',
  -- linkage
  "taskId" text NULL REFERENCES "Task"("id") ON DELETE SET NULL,
  "createdTaskId" text NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AISuggestion_conversationId_idx" ON "AISuggestion" ("conversationId");
CREATE INDEX IF NOT EXISTS "AISuggestion_projectId_idx" ON "AISuggestion" ("projectId");
CREATE INDEX IF NOT EXISTS "AISuggestion_status_idx" ON "AISuggestion" ("status");
CREATE INDEX IF NOT EXISTS "AISuggestion_userId_idx" ON "AISuggestion" ("userId");
CREATE INDEX IF NOT EXISTS "AISuggestion_type_idx" ON "AISuggestion" ("type");
CREATE INDEX IF NOT EXISTS "AISuggestion_hash_idx" ON "AISuggestion" ("hash");


