// Stub AI service - AI functionality removed
// This provides minimal stub implementations to prevent crashes

export default {
  chat: async () => ({ response: 'AI services disabled', suggestions: [] }),

  generateSuggestions: async () => [],

  storeSuggestions: async (prisma, convId, projectId, suggestions, userId) => {
    return suggestions.map((suggestion, index) => ({
      id: `stub-${index}`,
      data: suggestion,
      type: 'plan_task'
    }));
  },

  createTaskFromText: async (text, userId) => ({
    title: text.substring(0, 50),
    description: text,
    status: 'todo',
    priority: 'medium',
    userId
  }),

  findDuplicates: async () => [],

  breakDownTask: async (task) => [
    { title: `Subtask 1 for ${task.title}`, description: 'Auto-generated subtask', priority: 'medium' },
    { title: `Subtask 2 for ${task.title}`, description: 'Auto-generated subtask', priority: 'medium' }
  ],

  scoreTaskPriority: async (task, allTasks) => ({
    priority: 'medium',
    rationale: 'AI services disabled - default priority assigned'
  }),

  estimateTimeline: async (task, children) => ({
    estimatedHours: 8,
    confidence: 0.5,
    explanation: 'AI services disabled - default estimate'
  }),

  generateWeeklyDigest: async (allTasks, completedTasks) => ({
    summary: 'AI services disabled - no digest available',
    highlights: [],
    recommendations: []
  }),

  generateReminders: async (task) => [],

  predictProgress: async (task, historicalTasks) => ({
    completionPercentage: 50,
    estimatedCompletionDate: null,
    confidence: 0.5,
    factors: ['AI services disabled']
  }),

  processWorkflowTriggers: async (task, action, prisma) => [],

  findDuplicates: async (newTask, existingTasks) => []
};