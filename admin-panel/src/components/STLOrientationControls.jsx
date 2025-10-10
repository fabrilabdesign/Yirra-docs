import React from 'react';

const STLOrientationControls = ({ onOrientationChange, className = '' }) => {
  const handleControl = (action) => {
    if (window.stlViewerRotate) {
      window.stlViewerRotate(action);
      if (onOrientationChange) {
        onOrientationChange(action);
      }
    } else {
      alert('3D viewer is still loading. Please wait a moment and try again.');
    }
  };

  return (
    <div className={`orientation-controls ${className}`}>
      <div className="controls-header">
        <h4>Orientation Controls</h4>
        <p className="controls-hint">Fix orientation of upside-down or mirrored STL files</p>
      </div>
      
      <div className="controls-grid">
        <button 
          className="control-btn flip-x" 
          onClick={() => handleControl('flipX')}
          title="Flip upside down STL"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>Flip X</span>
        </button>
        
        <button 
          className="control-btn flip-y" 
          onClick={() => handleControl('flipY')}
          title="Mirror left/right"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4m0 0l4-4m-4 4l4 4m12 6H8m0 0l4-4m-4 4l4 4" />
          </svg>
          <span>Flip Y</span>
        </button>
        
        <button 
          className="control-btn rotate" 
          onClick={() => handleControl('rotate90')}
          title="Rotate 90 degrees clockwise"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9" />
          </svg>
          <span>90°</span>
        </button>
        
        <button 
          className="control-btn reset" 
          onClick={() => handleControl('reset')}
          title="Reset to original orientation"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      <style jsx>{`
        .orientation-controls {
          background: rgba(15, 20, 25, 0.6);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
        }

        .controls-header {
          margin-bottom: 16px;
        }

        .controls-header h4 {
          margin: 0 0 8px 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .controls-hint {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.4;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .control-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #60a5fa;
          font-size: 13px;
          font-weight: 600;
        }

        .control-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .control-btn svg {
          width: 20px;
          height: 20px;
        }

        .control-btn span {
          margin: 0;
        }

        /* Specific button colors */
        .control-btn.flip-x {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        .control-btn.flip-x:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }

        .control-btn.flip-y {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .control-btn.flip-y:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .control-btn.rotate {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          color: #8b5cf6;
        }

        .control-btn.rotate:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .control-btn.reset {
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.3);
          color: #f87171;
        }

        .control-btn.reset:hover {
          background: rgba(248, 113, 113, 0.2);
          border-color: rgba(248, 113, 113, 0.5);
          box-shadow: 0 4px 12px rgba(248, 113, 113, 0.2);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .controls-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .control-btn {
            padding: 12px 8px;
            gap: 4px;
          }

          .control-btn svg {
            width: 18px;
            height: 18px;
          }

          .control-btn span {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default STLOrientationControls;