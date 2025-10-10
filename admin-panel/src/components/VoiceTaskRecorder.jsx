import React, { useState, useEffect } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { useAuth } from '@clerk/clerk-react';

const VoiceTaskRecorder = ({ onTaskCreated, className = '' }) => {
  const { getToken } = useAuth();
  const { 
    isRecording, 
    audioBlob, 
    duration, 
    error, 
    startRecording, 
    stopRecording, 
    clearRecording, 
    formatDuration 
  } = useVoiceRecorder();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedTask, setParsedTask] = useState(null);

  useEffect(() => {
    if (audioBlob && !isProcessing) {
      processAudio();
    }
  }, [audioBlob]);

  const processAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Step 1: Convert audio to text
      const transcript = await speechToText(audioBlob);
      setTranscription(transcript);
      
      // Step 2: Parse task from text
      const task = await parseTaskFromText(transcript);
      setParsedTask(task);
      
    } catch (err) {
      console.error('Audio processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speechToText = async (audioBlob) => {
    // For now, simulate speech-to-text
    // In production, integrate with services like:
    // - Web Speech API (free, browser-based)
    // - OpenAI Whisper API
    // - Google Speech-to-Text
    // - Azure Speech Services
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate transcription based on recording duration
        const mockTranscriptions = [
          "Add task to test the new motor controller by Friday",
          "Mark component motor dash zero zero one as needs ordering",
          "Set prototype status to testing phase",
          "Order ten units of Arduino Nano for prototype build",
          "Schedule prototype review meeting for next Tuesday",
          "Component resistor ten K is running low in inventory"
        ];
        
        const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
        resolve(mockTranscriptions[randomIndex]);
      }, 2000); // Simulate processing time
    });
  };

  const parseTaskFromText = async (text) => {
    // Parse the transcription to extract task details
    // This would use NLP in production (OpenAI, spaCy, etc.)
    
    const task = {
      title: text,
      type: 'general',
      priority: 'medium',
      dueDate: null,
      assignee: null,
      component: null,
      action: null,
      rawText: text
    };

    // Simple keyword extraction
    const lowerText = text.toLowerCase();
    
    // Detect task type
    if (lowerText.includes('order') || lowerText.includes('purchase') || lowerText.includes('buy')) {
      task.type = 'procurement';
      task.action = 'order';
    } else if (lowerText.includes('test') || lowerText.includes('verify') || lowerText.includes('check')) {
      task.type = 'testing';
      task.action = 'test';
    } else if (lowerText.includes('prototype') || lowerText.includes('build') || lowerText.includes('assembly')) {
      task.type = 'development';
      task.action = 'build';
    } else if (lowerText.includes('inventory') || lowerText.includes('stock') || lowerText.includes('low')) {
      task.type = 'inventory';
      task.action = 'restock';
    }

    // Detect priority
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('immediately')) {
      task.priority = 'high';
    } else if (lowerText.includes('whenever') || lowerText.includes('eventually') || lowerText.includes('low priority')) {
      task.priority = 'low';
    }

    // Extract due dates
    const datePatterns = [
      /by (\w+day)/i,
      /by (\w+ \d+)/i,
      /(\w+day)/i
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        task.dueDate = parseDateFromText(match[1]);
        break;
      }
    }

    // Extract components
    const componentMatch = text.match(/(?:component|part)\s+([^,.\s]+(?:\s+[^,.\s]+)*)/i);
    if (componentMatch) {
      task.component = componentMatch[1];
    }

    // Generate a cleaner title
    task.title = generateTaskTitle(task);

    return task;
  };

  const parseDateFromText = (dateText) => {
    const today = new Date();
    const lowerDate = dateText.toLowerCase();
    
    if (lowerDate.includes('friday')) {
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      const friday = new Date(today);
      friday.setDate(today.getDate() + (daysUntilFriday || 7));
      return friday.toISOString().split('T')[0];
    }
    
    if (lowerDate.includes('monday')) {
      const daysUntilMonday = (1 - today.getDay() + 7) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() + (daysUntilMonday || 7));
      return monday.toISOString().split('T')[0];
    }
    
    if (lowerDate.includes('tuesday')) {
      const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
      const tuesday = new Date(today);
      tuesday.setDate(today.getDate() + (daysUntilTuesday || 7));
      return tuesday.toISOString().split('T')[0];
    }
    
    // Add more date parsing logic as needed
    return null;
  };

  const generateTaskTitle = (task) => {
    if (task.type === 'procurement' && task.component) {
      return `Order ${task.component}`;
    }
    
    if (task.type === 'testing' && task.component) {
      return `Test ${task.component}`;
    }
    
    if (task.type === 'inventory') {
      return `Check inventory levels`;
    }
    
    // Extract the main action from the raw text
    const words = task.rawText.split(' ');
    const actionWords = ['add', 'create', 'order', 'test', 'verify', 'build', 'schedule'];
    const actionIndex = words.findIndex(word => 
      actionWords.includes(word.toLowerCase())
    );
    
    if (actionIndex !== -1) {
      return words.slice(actionIndex).join(' ').replace(/^(add task to?|create task to?)/i, '').trim();
    }
    
    return task.rawText;
  };

  const createTask = async () => {
    if (!parsedTask) return;
    
    try {
      const token = await getToken();
      
      // In production, save to your backend
      const taskData = {
        ...parsedTask,
        id: `task_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        source: 'voice'
      };
      
      // Simulate API call
      console.log('Creating task:', taskData);
      
      if (onTaskCreated) {
        onTaskCreated(taskData);
      }
      
      // Reset the recorder
      clearRecording();
      setTranscription('');
      setParsedTask(null);
      
    } catch (err) {
      console.error('Task creation error:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
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

  return (
    <div className={`bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🎤 Voice Task Entry
      </h3>

      {!audioBlob && !isRecording && (
        <div className="text-center space-y-4">
          <div className="text-gray-400 mb-4">
            Tap and hold to record a task
          </div>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="w-24 h-24 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-2xl transition-colors shadow-lg"
            disabled={isProcessing}
          >
            🎤
          </button>
          <p className="text-sm text-gray-400">
            Hold to record, release to stop
          </p>
        </div>
      )}

      {isRecording && (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl animate-pulse mx-auto">
            🎤
          </div>
          <div className="text-white">
            Recording... {formatDuration(duration)}
          </div>
          <button
            onClick={stopRecording}
            className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Stop Recording
          </button>
        </div>
      )}

      {audioBlob && isProcessing && (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Processing audio...</p>
        </div>
      )}

      {transcription && parsedTask && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">Transcription:</h4>
            <p className="text-gray-300 text-sm italic">"{transcription}"</p>
          </div>

          <div className="bg-gray-700 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">Parsed Task:</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(parsedTask.type)}</span>
                <span className="text-white font-medium">{parsedTask.title}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(parsedTask.priority)}`}>
                  {parsedTask.priority} priority
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30">
                  {parsedTask.type}
                </span>
                {parsedTask.dueDate && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-900/30">
                    Due: {new Date(parsedTask.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {parsedTask.component && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Component:</span> {parsedTask.component}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={createTask}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              ✓ Create Task
            </button>
            <button
              onClick={() => {
                clearRecording();
                setTranscription('');
                setParsedTask(null);
              }}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center text-sm mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceTaskRecorder;