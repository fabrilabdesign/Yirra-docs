import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import aiService from './ai.js';

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Health before auth
app.get('/health', (req, res) => res.send('ok'));

// Basic auth guard placeholder (staging): require Bearer token present for project APIs only
app.use('/api/admin/projects', (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Helpers
function parseIntOr(val, fallback) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

// GET tasks with pagination/search/sort
app.get('/api/admin/projects/tasks', async (req, res) => {
  const page = parseIntOr(req.query.page, 1);
  const limit = parseIntOr(req.query.limit, 20);
  const search = (req.query.search || '').toString();
  const sortBy = (req.query.sortBy || 'created_at').toString();
  const sortOrder = (req.query.sortOrder || 'desc').toString();
  const status = req.query.status?.toString();
  const priority = req.query.priority?.toString();
  const projectId = req.query.projectId?.toString();
  const assigneeId = req.query.assigneeId?.toString();

  const whereConditions = [
    { parentId: null } // Only root tasks, exclude sub-tasks
  ];

  // Add filters only when they have valid values
  if (projectId && projectId !== 'null' && projectId !== '') {
    whereConditions.push({ projectId });
  }
  if (status && status !== '') {
    whereConditions.push({ status });
  }
  if (priority && priority !== '') {
    whereConditions.push({ priority });
  }
  if (assigneeId && assigneeId !== '') {
    whereConditions.push({ assigneeId });
  }
  if (search && search.trim()) {
    whereConditions.push({
      OR: [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } }
      ]
    });
  }

  const where = {
    AND: whereConditions
  };

  const orderBy = (() => {
    if (sortBy === 'title') return { title: sortOrder };
    return { createdAt: sortOrder };
  })();

  const [total, rows] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  res.json({
    tasks: rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      project_id: t.projectId,
      due_date: t.dueDate,
      assignee_id: t.assigneeId,
      created_at: t.createdAt,
      notes_count: 0
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalTasks: total
    }
  });
});

// GET task details (+ notes + children)
app.get('/api/admin/projects/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { children: true }
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const notes = await prisma.taskNote.findMany({ where: { taskId: id }, orderBy: { createdAt: 'desc' } });
  const timeEntries = await prisma.timeEntry.findMany({ where: { taskId: id }, orderBy: { date: 'desc' } });
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
  res.json({
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      parent_id: task.parentId,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate,
      assignee_id: task.assigneeId,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    },
    notes: notes.map(n => ({ id: n.id, task_id: n.taskId, note_text: n.noteText, created_at: n.createdAt })),
    children: task.children.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      priority: c.priority,
      due_date: c.dueDate,
      assignee_id: c.assigneeId
    })),
    timeEntries: timeEntries.map(e => ({ id: e.id, hours: e.hours, date: e.date, description: e.description })),
    totalHours
  });
});

// POST task
app.post('/api/admin/projects/tasks', async (req, res) => {
  const { title, description, projectId, parentId, status, priority, dueDate, assigneeId } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  const created = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      projectId: projectId || null,
      parentId: parentId || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null
    }
  });
  res.status(201).json({
    id: created.id,
    title: created.title,
    description: created.description,
    parent_id: created.parentId,
    status: created.status,
    priority: created.priority,
    project_id: created.projectId,
    due_date: created.dueDate,
    assignee_id: created.assigneeId,
    created_at: created.createdAt
  });
});

// PUT task (partial update)
app.put('/api/admin/projects/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body || {};

  // Validate title if provided
  if (title !== undefined && (!title || !title.trim())) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  // Build update data with only provided fields
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
  if (projectId !== undefined) updateData.projectId = projectId;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: updateData
  });
  res.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    status: updated.status,
    priority: updated.priority,
    project_id: updated.projectId,
    due_date: updated.dueDate,
    assignee_id: updated.assigneeId,
    updated_at: updated.updatedAt
  });
});

// DELETE task
app.delete('/api/admin/projects/tasks/:id', async (req, res) => {
  const id = req.params.id;
  await prisma.taskNote.deleteMany({ where: { taskId: id } });
  await prisma.task.delete({ where: { id } });
  res.json({ success: true });
});

// Notes
app.get('/api/admin/projects/tasks/:id/notes', async (req, res) => {
  const taskId = req.params.id;
  const notes = await prisma.taskNote.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } });
  res.json(notes.map(n => ({ id: n.id, task_id: n.taskId, note_text: n.noteText, created_at: n.createdAt })));
});

app.post('/api/admin/projects/tasks/:id/notes', async (req, res) => {
  const taskId = req.params.id;
  const { note_text } = req.body || {};
  if (!note_text || !note_text.trim()) return res.status(400).json({ error: 'Note text is required' });
  const created = await prisma.taskNote.create({ data: { taskId, noteText: note_text.trim() } });
  res.status(201).json({ id: created.id, task_id: created.taskId, note_text: created.noteText, created_at: created.createdAt });
});

app.delete('/api/admin/projects/notes/:noteId', async (req, res) => {
  const noteId = req.params.noteId;
  await prisma.taskNote.delete({ where: { id: noteId } });
  res.json({ success: true });
});

// Time Tracking
app.get('/api/admin/projects/tasks/:taskId/time-entries', async (req, res) => {
  const taskId = req.params.taskId;
  const entries = await prisma.timeEntry.findMany({
    where: { taskId },
    orderBy: { date: 'desc' }
  });
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  res.json({ timeEntries: entries, totalHours });
});

app.post('/api/admin/projects/tasks/:taskId/time-entries', async (req, res) => {
  const taskId = req.params.taskId;
  const { hours, date, description } = req.body || {};
  if (!hours || hours <= 0) return res.status(400).json({ error: 'Valid hours required' });
  const entry = await prisma.timeEntry.create({
    data: {
      taskId,
      userId: req.user?.id || 'unknown',
      hours: parseFloat(hours),
      date: new Date(date),
      description: description?.trim() || null
    }
  });
  res.status(201).json(entry);
});

app.put('/api/admin/projects/time-entries/:entryId', async (req, res) => {
  const entryId = req.params.entryId;
  const { hours, date, description } = req.body || {};
  if (!hours || hours <= 0) return res.status(400).json({ error: 'Valid hours required' });
  const updated = await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      hours: parseFloat(hours),
      date: new Date(date),
      description: description?.trim() || null
    }
  });
  res.json(updated);
});

app.delete('/api/admin/projects/time-entries/:entryId', async (req, res) => {
  const entryId = req.params.entryId;
  await prisma.timeEntry.delete({ where: { id: entryId } });
  res.json({ success: true });
});

// Project CRUD Endpoints
app.get('/api/admin/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true }
        },
        tasks: {
          where: { status: 'done' },
          select: { id: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate completion percentage for each project
    const projectsWithStats = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: project.ownerId,
      startDate: project.startDate,
      dueDate: project.dueDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      taskCount: project._count.tasks,
      completedTasks: project.tasks.length,
      completionPercentage: project._count.tasks > 0
        ? Math.round((project.tasks.length / project._count.tasks) * 100)
        : 0
    }));

    res.json({ projects: projectsWithStats });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/admin/projects', async (req, res) => {
  try {
    const { name, description, status, startDate, dueDate } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Project name is required' });

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || 'active',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId: req.user?.id || 'unknown'
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true }
        },
        tasks: {
          where: { status: 'done' },
          select: { id: true }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectWithStats = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: project.ownerId,
      startDate: project.startDate,
      dueDate: project.dueDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      taskCount: project._count.tasks,
      completedTasks: project.tasks.length,
      completionPercentage: project._count.tasks > 0
        ? Math.round((project.tasks.length / project._count.tasks) * 100)
        : 0
    };

    res.json({ project: projectWithStats });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.put('/api/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, dueDate } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });

    res.json({ project });
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/admin/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project has tasks
    const taskCount = await prisma.task.count({ where: { projectId: id } });
    if (taskCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete project with existing tasks. Move or delete tasks first.'
      });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// AI Integration Endpoints

// Natural language task creation
app.post('/api/admin/projects/ai/create-task', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text input required' });

    const taskData = await aiService.createTaskFromText(text.trim(), req.user?.id || 'unknown');

    // Check for duplicates
    const allTasks = await prisma.task.findMany({ where: { parentId: null } });
    const duplicates = await aiService.findDuplicates(taskData, allTasks);

    const newTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        assigneeId: taskData.userId,
      }
    });

    // Create duplicate suggestions if found
    if (duplicates.length > 0) {
      for (const dup of duplicates) {
        await prisma.aISuggestion.create({
          data: {
            type: 'duplicate',
            taskId: newTask.id,
            data: { duplicateTaskId: dup.taskId },
            confidence: dup.confidence,
            rationale: dup.reason,
            userId: req.user?.id || 'unknown',
          }
        });
      }
    }

    res.status(201).json({ task: newTask, duplicates });
  } catch (error) {
    console.error('AI task creation error:', error);
    res.status(500).json({ error: 'Failed to create task with AI' });
  }
});

// Smart task breakdown
app.post('/api/admin/projects/tasks/:taskId/ai/breakdown', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtasks = await aiService.breakDownTask(task);

    // Create AI suggestion for subtasks
    await prisma.aISuggestion.create({
      data: {
        type: 'subtasks',
        taskId,
        data: { subtasks },
        confidence: 0.8,
        rationale: 'AI-generated task breakdown for better organization',
        userId: req.user?.id || 'unknown',
      }
    });

    res.json({ subtasks });
  } catch (error) {
    console.error('AI breakdown error:', error);
    res.status(500).json({ error: 'Failed to break down task' });
  }
});

// Priority scoring
app.get('/api/admin/projects/tasks/:taskId/ai/priority', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const allTasks = await prisma.task.findMany({ where: { parentId: null } });
    const suggestion = await aiService.scoreTaskPriority(task, allTasks);

    // Store suggestion
    const aiSuggestion = await prisma.aISuggestion.create({
      data: {
        type: 'priority',
        taskId,
        data: { suggestedPriority: suggestion.priority },
        confidence: 0.7,
        rationale: suggestion.rationale,
        userId: req.user?.id || 'unknown',
      }
    });

    res.json({ suggestion, suggestionId: aiSuggestion.id });
  } catch (error) {
    console.error('AI priority error:', error);
    res.status(500).json({ error: 'Failed to score priority' });
  }
});

// Timeline estimation
app.get('/api/admin/projects/tasks/:taskId/ai/timeline', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { children: true }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const estimation = await aiService.estimateTimeline(task, task.children);

    await prisma.aISuggestion.create({
      data: {
        type: 'timeline',
        taskId,
        data: estimation,
        confidence: 0.6,
        rationale: estimation.explanation,
        userId: req.user?.id || 'unknown',
      }
    });

    res.json({ estimation });
  } catch (error) {
    console.error('AI timeline error:', error);
    res.status(500).json({ error: 'Failed to estimate timeline' });
  }
});

// Weekly digest
app.get('/api/admin/projects/ai/weekly-digest', async (req, res) => {
  try {
    const allTasks = await prisma.task.findMany({
      where: { parentId: null },
      orderBy: { updatedAt: 'desc' }
    });

    const completedTasks = allTasks.filter(t => t.status === 'done').slice(0, 10);
    const digest = await aiService.generateWeeklyDigest(allTasks, completedTasks);

    res.json({ digest });
  } catch (error) {
    console.error('AI digest error:', error);
    res.status(500).json({ error: 'Failed to generate digest' });
  }
});

// Get AI suggestions for user
app.get('/api/admin/projects/ai/suggestions', async (req, res) => {
  try {
    const suggestions = await prisma.aISuggestion.findMany({
      where: {
        userId: req.user?.id || 'unknown',
        status: 'pending'
      },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('AI suggestions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Accept/reject AI suggestion
app.post('/api/admin/projects/ai/suggestions/:suggestionId/:action', async (req, res) => {
  try {
    const { suggestionId, action } = req.params;
    if (!['accept', 'reject', 'dismiss'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const suggestion = await prisma.aISuggestion.findUnique({
      where: { id: suggestionId }
    });

    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    // Update suggestion status
    await prisma.aISuggestion.update({
      where: { id: suggestionId },
      data: { status: action === 'accept' ? 'accepted' : 'rejected' }
    });

    // If accepting, apply the suggestion
    if (action === 'accept' && suggestion.taskId) {
      const updateData = {};

      switch (suggestion.type) {
        case 'priority':
          updateData.priority = suggestion.data.suggestedPriority;
          break;
        case 'assignee':
          updateData.assigneeId = suggestion.data.suggestedAssigneeId;
          break;
        case 'timeline':
          updateData.dueDate = new Date(Date.now() + suggestion.data.estimatedHours * 60 * 60 * 1000);
          break;
        case 'subtasks':
          // Create subtasks
          for (const subtask of suggestion.data.subtasks) {
            await prisma.task.create({
              data: {
                parentId: suggestion.taskId,
                title: subtask.title,
                description: subtask.description,
                priority: subtask.priority,
                status: 'todo',
              }
            });
          }
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.task.update({
          where: { id: suggestion.taskId },
          data: updateData
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('AI suggestion action error:', error);
    res.status(500).json({ error: 'Failed to process suggestion' });
  }
});

// AI Execution Features

// Get smart reminders for all tasks
app.get('/api/admin/projects/ai/reminders', async (req, res) => {
  try {
    const allTasks = await prisma.task.findMany({ where: { parentId: null } });
    const allReminders = [];

    for (const task of allTasks) {
      const reminders = await aiService.generateReminders(task);
      allReminders.push(...reminders.map(r => ({ ...r, taskId: task.id, taskTitle: task.title })));
    }

    // Sort by urgency
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    allReminders.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);

    res.json({ reminders: allReminders.slice(0, 20) }); // Limit to top 20
  } catch (error) {
    console.error('AI reminders error:', error);
    res.status(500).json({ error: 'Failed to generate reminders' });
  }
});

// Progress prediction for a task
app.get('/api/admin/projects/tasks/:taskId/ai/progress', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const historicalTasks = await prisma.task.findMany({
      where: { parentId: null, status: 'done' },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    const prediction = await aiService.predictProgress(task, historicalTasks);

    res.json({ prediction });
  } catch (error) {
    console.error('AI progress prediction error:', error);
    res.status(500).json({ error: 'Failed to predict progress' });
  }
});

// Process workflow triggers (called internally or via webhooks)
app.post('/api/admin/projects/tasks/:taskId/workflow/:action', async (req, res) => {
  try {
    const { taskId, action } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const triggers = await aiService.processWorkflowTriggers(task, action, prisma);

    // Log triggers (in a real app, these would trigger notifications/emails)
    console.log('Workflow triggers:', triggers);

    res.json({ triggers });
  } catch (error) {
    console.error('Workflow processing error:', error);
    res.status(500).json({ error: 'Failed to process workflow' });
  }
});

// Enhanced duplicate detection with better AI
app.post('/api/admin/projects/ai/duplicates', async (req, res) => {
  try {
    const { taskTitle, taskDescription } = req.body;
    if (!taskTitle) return res.status(400).json({ error: 'Task title required' });

    const newTaskData = { title: taskTitle, description: taskDescription };
    const existingTasks = await prisma.task.findMany({
      where: { parentId: null },
      take: 100
    });

    const duplicates = await aiService.findDuplicates(newTaskData, existingTasks);

    res.json({ duplicates });
  } catch (error) {
    console.error('AI duplicate detection error:', error);
    res.status(500).json({ error: 'Failed to detect duplicates' });
  }
});

// Automated task status updates (webhook-style endpoint)
app.post('/api/admin/projects/webhooks/task-updated', async (req, res) => {
  try {
    const { taskId, oldStatus, newStatus } = req.body;

    if (!taskId || !newStatus) return res.status(400).json({ error: 'taskId and newStatus required' });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Trigger AI workflows based on status change
    if (oldStatus !== newStatus) {
      const triggers = await aiService.processWorkflowTriggers({ ...task, status: newStatus }, 'status_changed', prisma);

      // Process triggers (send notifications, create follow-ups, etc.)
      for (const trigger of triggers) {
        console.log(`Trigger: ${trigger.type} - ${trigger.message}`);
        // In a real app, send emails, Slack notifications, etc.
      }
    }

    res.json({ success: true, triggers: triggers || [] });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`projects-svc listening on :${port}`);
});
