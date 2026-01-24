import { z } from 'zod';

// Schema for plan requests
export const PlanRequestSchema = z.object({
  projectId: z.string().optional(),
  userPrompt: z.string().min(1),
  conversationId: z.string().optional(),
  count: z.number().min(1).max(50).optional()
});

// Schema for commit requests
export const CommitRequestSchema = z.object({
  projectId: z.string().optional(),
  conversationId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  selections: z.array(z.object({
    suggestionId: z.string().min(1),
    override: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      priority: z.string().optional(),
      labels: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional()
    }).optional()
  })).min(1)
});