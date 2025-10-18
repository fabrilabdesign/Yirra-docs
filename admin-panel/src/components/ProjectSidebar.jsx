import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, ChevronLeft, ChevronRight, Folder, Calendar, CheckCircle, Users, Edit, Trash2 } from 'lucide-react';

const ProjectSidebar = ({
  isOpen,
  onToggle,
  selectedProjectId,
  onProjectSelect,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  refreshTrigger
}) => {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Touch gesture handling
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    touchEndRef.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50; // Swipe left (close)
    const isRightSwipe = distance < -50; // Swipe right (open)

    // Only handle swipes on mobile/tablet
    if (window.innerWidth < 1024) {
      if (isOpen && isLeftSwipe) {
        onToggle(); // Close sidebar
      } else if (!isOpen && isRightSwipe) {
        onToggle(); // Open sidebar
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, refreshTrigger]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setError(null);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      console.error('Projects fetch error:', err);
      setError('Failed to load projects');
      setProjects([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-16 z-40 h-10 w-10 rounded-12 bg-surface border border-line-soft shadow-lg flex items-center justify-center hover:bg-elev1 transition-all duration-200 ${
          // Mobile/tablet: Always right-4 for accessibility
          // Desktop: Adjust based on sidebar state
          isOpen ? 'right-4 lg:right-80 xl:right-96' : 'right-4'
        }`}
        aria-label={isOpen ? 'Close projects sidebar' : 'Open projects sidebar'}
      >
        {isOpen ? (
          <ChevronRight size={18} className="text-text-primary" />
        ) : (
          <ChevronLeft size={18} className="text-text-primary" />
        )}
      </button>

      {/* Sidebar - Modal overlay on mobile/tablet, push on desktop */}
      <div
        className={`sidebar-modal fixed top-14 right-0 h-[calc(100vh-3.5rem)] bg-surface border-l border-line-soft shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          // Mobile/tablet: Full width modal overlay
          // Desktop: Fixed width sidebar
          isOpen
            ? 'w-full max-w-sm translate-x-0 lg:w-80 xl:w-96'
            : 'w-full max-w-sm translate-x-full lg:w-80 xl:w-96'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="complementary"
        aria-label="Projects sidebar"
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-line-soft">
            <h2 className="text-[18px] font-semibold text-text-primary flex items-center gap-2">
              <Folder size={20} />
              Projects
            </h2>
            <button
              onClick={onCreateProject}
              className="h-8 w-8 rounded-10 bg-brand text-text-inverse flex items-center justify-center hover:bg-brand-600 transition-colors"
              aria-label="Create new project"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-elev1 rounded-12"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-danger mb-2">⚠️</div>
                <p className="text-[14px] text-text-secondary">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="mt-3 text-[13px] text-brand hover:text-brand-600 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : (!projects || projects.length === 0) ? (
              <div className="text-center py-12">
                <Folder size={48} className="mx-auto mb-4 text-text-tertiary" />
                <h3 className="text-[16px] font-medium text-text-primary mb-2">No projects yet</h3>
                <p className="text-[13px] text-text-secondary mb-4">
                  Create your first project to get started organizing tasks.
                </p>
                <button
                  onClick={onCreateProject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-text-inverse rounded-10 hover:bg-brand-600 transition-colors text-[13px] font-medium"
                >
                  <Plus size={16} />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* All Tasks Option */}
                <button
                  onClick={() => onProjectSelect(null)}
                  className={`w-full p-4 rounded-12 border transition-all duration-200 text-left ${
                    selectedProjectId === null
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-elev1 border-line-soft hover:bg-elev2 hover:border-line-strong text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <div>
                        <div className="font-medium text-[14px]">All Tasks</div>
                        <div className="text-[12px] text-text-secondary">
                          {projects.reduce((total, p) => total + p.taskCount, 0)} total tasks
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Project List */}
                {(projects || []).map((project) => (
                  <div className="relative group">
                    {onEditProject && onDeleteProject && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProject(project);
                          }}
                          className="p-1 rounded-6 hover:bg-elev2 text-text-secondary hover:text-text-primary transition-colors"
                          title="Edit project"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 rounded-6 hover:bg-elev2 text-danger hover:opacity-90 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    <button
                      key={project.id}
                      onClick={() => onProjectSelect(project.id)}
                      className={`w-full p-4 rounded-12 border transition-all duration-200 text-left ${
                        selectedProjectId === project.id
                          ? 'bg-brand/10 border-brand text-brand'
                          : 'bg-elev1 border-line-soft hover:bg-elev2 hover:border-line-strong text-text-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                          <div className="font-medium text-[14px] truncate">{project.name}</div>
                        </div>

                        {project.description && (
                          <div className="text-[12px] text-text-secondary mb-2 line-clamp-1">
                            {project.description}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} />
                              {project.completedTasks}/{project.taskCount}
                            </div>
                            {project.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(project.dueDate)}
                              </div>
                            )}
                          </div>

                          {project.completionPercentage > 0 && (
                            <div className="text-[11px] text-text-secondary">
                              {project.completionPercentage}%
                            </div>
                          )}
                        </div>

                        {project.completionPercentage > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-elev2 rounded-full h-1">
                              <div
                                className="bg-success h-1 rounded-full transition-all duration-300"
                                style={{ width: `${project.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop - covers content area but not sidebar */}
      {isOpen && (
        <div
          className="fixed top-14 left-0 bottom-0 right-[24rem] bg-black/50 z-40 lg:bg-black/20 lg:right-80 xl:right-96"
          onClick={onToggle}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-[55]">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-md w-full border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="text-[16px] font-semibold text-text-primary">Delete Project</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProjectToDelete(null);
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-hover rounded-10"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-text-primary">Delete Project</h3>
                  <p className="text-[13px] text-text-secondary mt-1">
                    Are you sure you want to delete <strong>"{projectToDelete.name}"</strong>?
                    This will permanently delete the project and cannot be undone.
                  </p>
                  {projectToDelete.taskCount > 0 && (
                    <p className="text-[12px] text-danger mt-2">
                      ⚠️ This project has {projectToDelete.taskCount} tasks. You must move or delete them first.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 h-9 px-3 border border-line-strong rounded-10 text-text-secondary hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDeleteProject) {
                      onDeleteProject(projectToDelete);
                    }
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  disabled={projectToDelete.taskCount > 0}
                  className="flex-1 h-9 px-3 bg-danger text-text-inverse rounded-10 hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSidebar;
