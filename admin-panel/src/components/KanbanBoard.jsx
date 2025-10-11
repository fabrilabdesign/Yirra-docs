import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Calendar, User, AlertCircle, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
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

const TaskCard = ({ task, onEdit, onDelete, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-12 border border-line-soft bg-elev1 p-3 shadow-elev1 hover:shadow-elev2 hover:-translate-y-px transition duration-150 ease-in ${isDragging ? 'cursor-grabbing scale-[0.998] shadow-elev2' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
      onClick={!isDragging ? () => onViewDetails(task) : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-[14px] leading-[22px] font-semibold text-text-primary mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-[13px] leading-5 text-text-secondary">{task.description}</p>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical size={16} className="text-text-tertiary" />
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
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const getColumnBg = () => {
    return 'bg-surface border-line-soft';
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-[320px] rounded-14 border border-line-soft bg-surface shadow-elev1 flex flex-col transition-colors duration-200 ${
        isOver ? 'border-dashed border-brand' : ''
      }`}
    >
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
        >
          <Plus size={16} />
        </button>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="px-3 pb-3 space-y-3 min-h-96">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
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

const KanbanBoard = ({ tasks, onEdit, onDelete, onViewDetails, onAddTask, onUpdateTask }) => {
  const { getToken } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Check if dropped on a column
    if (newStatus === 'todo' || newStatus === 'in_progress' || newStatus === 'done') {
      try {
        const token = await getToken();
        const response = await fetch(`/api/admin/projects/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          const updatedTask = await response.json();
          onUpdateTask(updatedTask);
        } else {
          console.error('Failed to update task status');
        }
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
    { id: 'done', title: 'Done', status: 'done' }
  ];

  const getTasksForColumn = (status) => tasks.filter(task => task.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-6 py-1">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.status}
              tasks={getTasksForColumn(column.status)}
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
