import React, { useCallback } from 'react';
import { Plus, Calendar, User, AlertCircle, GripVertical } from 'lucide-react';
import { DndContext, closestCorners, pointerWithin, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'todo':
      return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
    case 'in_progress':
      return 'bg-[rgba(99,102,241,.12)] text-brand';
    case 'done':
      return 'bg-[rgba(34,197,94,.12)] text-success';
    default:
      return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low':
      return 'bg-[rgba(34,197,94,.12)] text-success';
    case 'medium':
      return 'bg-[rgba(245,158,11,.12)] text-warning';
    case 'high':
      return 'bg-[rgba(239,68,68,.12)] text-danger';
    default:
      return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
  }
};

const TaskCard = ({ task, onEdit, onDelete, onViewDetails, isUpdating = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group kanban-card rounded-12 border border-line-soft bg-elev1 p-3 shadow-elev1 hover:shadow-elev2 hover:-translate-y-px transition-all duration-200 ease-out ${
        isDragging ? 'dragging cursor-grabbing scale-[1.02] shadow-elev3 rotate-1' : ''
      } ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      data-testid={`task-card-${task.id}`}
      data-status={task.status}
      data-priority={task.priority}
      aria-label={`Task: ${task.title}. Status: ${task.status}. Drag to move between columns.`}
      aria-describedby={`task-${task.id}-description`}
      onClick={!isDragging ? () => onViewDetails(task) : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails(task);
        }
      }}
    >
      {isUpdating && (
        <div className="absolute inset-0 bg-surface/50 rounded-12 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
        </div>
      )}

      <div id={`task-${task.id}-description`} className="sr-only">
        {task.description || 'No description'}
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-[14px] leading-[22px] font-semibold text-text-primary mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-[13px] leading-5 text-text-secondary">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-brand p-1 rounded hover:bg-hover"
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag handle"
          >
            <GripVertical size={16} className="text-text-tertiary" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-text-tertiary">
          {task.status && (
            <span className="flex items-center gap-1 text-[12px]">
              <div className={`w-2 h-2 rounded-full ${
                task.status === 'todo' ? 'bg-text-tertiary' :
                task.status === 'in_progress' ? 'bg-brand' :
                'bg-success'
              }`} />
              {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
            </span>
          )}
          {task.priority && (
            <span className="flex items-center gap-1 text-[12px]">
              {task.priority}
            </span>
          )}
        </div>
        {task.due_date && (
          <div className="flex items-center text-[12px] text-text-tertiary">
            <Calendar size={12} className="mr-1" />
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
      {task.assignee_id && (
        <div className="flex -space-x-1.5 mt-3">
          <div className="w-6 h-6 rounded-md bg-brand text-text-inverse text-12 font-medium flex items-center justify-center border-2 border-surface">
            {task.assignee_id.slice(0,2).toUpperCase()}
          </div>
        </div>
      )}
    </article>
  );
};

const KanbanColumn = ({ title, status, tasks, onEdit, onDelete, onViewDetails, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
      accepts: ['task']
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full max-w-[360px] sm:w-[280px] md:w-[320px] lg:w-[360px] rounded-14 border-2 transition-all duration-200 flex flex-col ${
        isOver
          ? 'border-brand bg-brand/5 shadow-lg scale-[1.02] z-10'
          : 'border-line-soft bg-surface shadow-elev1 z-0'
      }`}
      data-testid={`kanban-column-${status}`}
      style={{ minHeight: '400px' }}
    >
      {isOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 bg-brand/5 rounded-14 border-2 border-dashed border-brand">
          <div className="text-brand text-center font-medium bg-surface/90 px-4 py-2 rounded">
            Drop here
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-[16px] leading-6 font-semibold text-text-primary flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'todo' ? 'bg-text-tertiary' :
            status === 'in_progress' ? 'bg-brand' :
            'bg-success'
          }`} />
          {title}
          <span className="h-[18px] px-2 rounded-full text-[12px] leading-[18px] font-semibold text-text-secondary bg-[rgba(99,102,241,.12)]">{tasks.length}</span>
        </h3>
        <button
          onClick={() => onAddTask(status)}
          className="text-text-tertiary hover:text-brand transition-colors p-1 rounded hover:bg-hover"
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>
      <SortableContext id={status} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="px-3 pb-3 space-y-3 min-h-96">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              isUpdating={task.isUpdating}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-text-tertiary">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-13">No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const KanbanBoard = ({
  tasks,
  optimisticUpdates,
  onDragEnd,
  onEdit,
  onDelete,
  onViewDetails,
  onAddTask
}) => {
  // Check if a task has an optimistic update (indicating it's being updated)
  const isTaskUpdating = useCallback((taskId) => {
    const optimistic = optimisticUpdates.get(taskId);
    return optimistic?.isUpdating || false;
  }, [optimisticUpdates]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    console.log('Drag started:', event.active.id);
  }, []);

  // Delegate drag end handling to parent component

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
    { id: 'done', title: 'Done', status: 'done' }
  ];

  const getTasksForColumn = (status) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 py-1 justify-start">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.status}
              tasks={getTasksForColumn(column.status).map(task => ({
                ...task,
                isUpdating: isTaskUpdating(task.id)
              }))}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onAddTask={onAddTask}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
