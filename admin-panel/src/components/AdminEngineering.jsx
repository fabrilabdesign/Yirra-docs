import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import VoiceTaskRecorder from './VoiceTaskRecorder';

const AdminEngineering = () => {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [prototypes, setPrototypes] = useState([]);
  const [partsQueue, setPartsQueue] = useState([]);
  const [activeView, setActiveView] = useState('tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngineeringData();
  }, []);

  const loadEngineeringData = async () => {
    try {
      setLoading(true);
      // Simulate loading data - replace with actual API calls
      
      // Mock tasks
      const mockTasks = [
        {
          id: 'task_001',
          title: 'Test new motor controller',
          type: 'testing',
          priority: 'high',
          status: 'pending',
          dueDate: '2024-01-19',
          assignee: 'Engineering Team',
          component: 'Motor Controller v2.1',
          createdAt: '2024-01-15T10:00:00Z',
          source: 'voice'
        },
        {
          id: 'task_002',
          title: 'Order Arduino Nano units',
          type: 'procurement',
          priority: 'medium',
          status: 'in_progress',
          dueDate: '2024-01-20',
          component: 'Arduino Nano',
          quantity: 10,
          createdAt: '2024-01-14T15:30:00Z',
          source: 'manual'
        },
        {
          id: 'task_003',
          title: 'Prototype battery optimization',
          type: 'development',
          priority: 'medium',
          status: 'pending',
          dueDate: '2024-01-25',
          createdAt: '2024-01-13T09:15:00Z',
          source: 'voice'
        }
      ];

      // Mock prototypes
      const mockPrototypes = [
        {
          id: 'proto_001',
          name: 'Drone v3.2 Alpha',
          status: 'testing',
          progress: 75,
          components: ['Frame', 'Motors', 'ESCs', 'Flight Controller'],
          lastUpdate: '2024-01-15T14:00:00Z',
          issues: ['Battery life below target', 'Vibration in hover mode']
        },
        {
          id: 'proto_002',
          name: 'Camera Gimbal v2.0',
          status: 'assembly',
          progress: 45,
          components: ['Gimbal Frame', 'Servo Motors', 'Control Board'],
          lastUpdate: '2024-01-14T11:30:00Z',
          issues: []
        }
      ];

      // Mock parts queue
      const mockPartsQueue = [
        {
          id: 'order_001',
          component: 'LiPo Battery 3S 2200mAh',
          quantity: 5,
          priority: 'high',
          estimatedCost: 125.00,
          supplier: 'HobbyKing',
          leadTime: '3-5 days',
          requestedBy: 'task_001'
        },
        {
          id: 'order_002',
          component: 'Carbon Fiber Prop 10x4.5',
          quantity: 20,
          priority: 'medium',
          estimatedCost: 60.00,
          supplier: 'APC Propellers',
          leadTime: '1-2 weeks',
          requestedBy: 'proto_001'
        }
      ];

      setTasks(mockTasks);
      setPrototypes(mockPrototypes);
      setPartsQueue(mockPartsQueue);
      
    } catch (err) {
      console.error('Error loading engineering data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    
    // If it's a procurement task, add to parts queue
    if (newTask.type === 'procurement' && newTask.component) {
      const partsOrder = {
        id: `order_${Date.now()}`,
        component: newTask.component,
        quantity: newTask.quantity || 1,
        priority: newTask.priority,
        estimatedCost: 0,
        supplier: 'TBD',
        leadTime: 'TBD',
        requestedBy: newTask.id
      };
      setPartsQueue(prev => [partsOrder, ...prev]);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const updatePrototypeStatus = async (protoId, newStatus) => {
    setPrototypes(prev => prev.map(proto =>
      proto.id === protoId
        ? { ...proto, status: newStatus, lastUpdate: new Date().toISOString() }
        : proto
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'low': return 'bg-green-900/30 text-green-300 border-green-700';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300';
      case 'in_progress': return 'bg-blue-900/50 text-blue-300';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300';
      case 'testing': return 'bg-purple-900/50 text-purple-300';
      case 'assembly': return 'bg-orange-900/50 text-orange-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'procurement': return '🛒';
      case 'testing': return '🔬';
      case 'development': return '🔧';
      case 'inventory': return '📦';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading engineering data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Engineering Dashboard</h2>
        
        {/* View Tabs */}
        <div className="flex rounded-xl bg-gray-800/50 p-1">
          {[
            { id: 'tasks', label: 'Tasks', icon: '📋' },
            { id: 'prototypes', label: 'Prototypes', icon: '🔧' },
            { id: 'parts', label: 'Parts Queue', icon: '🛒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Task Recorder */}
      <VoiceTaskRecorder onTaskCreated={handleTaskCreated} />

      {/* Content based on active view */}
      {activeView === 'tasks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Engineering Tasks</h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No tasks yet. Use voice recording to add some!
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(task.type)}</span>
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      {task.component && (
                        <p className="text-sm text-gray-400">Component: {task.component}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-sm text-gray-400">
                    {task.dueDate && (
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.assignee && (
                      <span className="ml-4">Assigned: {task.assignee}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'prototypes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Active Prototypes</h3>
          
          {prototypes.map(prototype => (
            <div key={prototype.id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium text-lg">{prototype.name}</h4>
                  <p className="text-sm text-gray-400">
                    Last updated: {new Date(prototype.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prototype.status)}`}>
                  {prototype.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{prototype.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${prototype.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Components */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Components:</p>
                <div className="flex flex-wrap gap-2">
                  {prototype.components.map((component, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {component}
                    </span>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {prototype.issues.length > 0 && (
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-red-400 text-sm mb-2">Issues:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {prototype.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                <button
                  onClick={() => updatePrototypeStatus(prototype.id, 'testing')}
                  className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Move to Testing
                </button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Add Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'parts' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Parts Ordering Queue</h3>
          
          {partsQueue.map(item => (
            <div key={item.id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{item.component}</h4>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Estimated Cost:</span>
                  <div className="text-white">${item.estimatedCost}</div>
                </div>
                <div>
                  <span className="text-gray-400">Lead Time:</span>
                  <div className="text-white">{item.leadTime}</div>
                </div>
                <div>
                  <span className="text-gray-400">Supplier:</span>
                  <div className="text-white">{item.supplier}</div>
                </div>
                <div>
                  <span className="text-gray-400">Requested by:</span>
                  <div className="text-white">{item.requestedBy}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Order Now
                </button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Edit Details
                </button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEngineering;