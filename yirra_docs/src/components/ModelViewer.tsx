import React, { useEffect } from 'react';

interface ModelViewerProps {
  modelPath: string;
  title?: string;
  format?: 'gltf' | 'glb' | 'obj' | 'stl';
  width?: string;
  height?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  title = "3D Model",
  format = 'gltf',
  width = "100%",
  height = "400px"
}) => {
  useEffect(() => {
    // Load model-viewer script dynamically
    if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.type = 'module';
      document.head.appendChild(script);
    }
  }, []);

  const getMimeType = (format: string) => {
    switch (format) {
      case 'gltf': return 'model/gltf+json';
      case 'glb': return 'model/gltf-binary';
      case 'obj': return 'model/obj';
      case 'stl': return 'model/stl';
      default: return 'model/gltf+json';
    }
  };

  return (
    <div style={{
      width,
      marginBottom: '16px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <model-viewer
        src={modelPath}
        alt={title}
        style={{
          width: '100%',
          height,
          backgroundColor: '#f6f8fa'
        }}
        camera-controls
        auto-rotate
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        camera-orbit="45deg 55deg 2.5m"
        min-camera-orbit="auto auto 1m"
        max-camera-orbit="auto auto 8m"
        interaction-prompt="auto"
        loading="eager"
      >
        <div slot="progress-bar" style={{
          display: 'block',
          width: '100%',
          height: '4px',
          backgroundColor: '#e1e4e8',
          position: 'absolute',
          bottom: '0'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#06b6d4',
            width: '0%',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        <button
          slot="ar-button"
          style={{
            backgroundColor: '#06b6d4',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            position: 'absolute',
            bottom: '16px',
            right: '16px'
          }}
        >
          🕶️ View in AR
        </button>

        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#24292f',
          backdropFilter: 'blur(8px)'
        }}>
          {title}
        </div>
      </model-viewer>
    </div>
  );
};
