import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

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

  const where = {
    AND: [
      { parentId: null }, // Only root tasks, exclude sub-tasks
      projectId ? { projectId } : {},
      status ? { status } : {},
      priority ? { priority } : {},
      assigneeId ? { assigneeId } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}
    ]
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
    due_date: created.dueDate,
    assignee_id: created.assigneeId,
    created_at: created.createdAt
  });
});

// PUT task (partial update)
app.put('/api/admin/projects/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, status, priority, dueDate, assigneeId } = req.body || {};

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

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`projects-svc listening on :${port}`);
});
