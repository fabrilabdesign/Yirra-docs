import React, { useEffect, useRef } from 'react';
import { ModelViewer } from './ModelViewer';

interface CADViewerProps {
  modelPath: string;
  title?: string;
  format?: 'gltf' | 'glb' | 'obj' | 'stl' | 'creo';
  width?: string;
  height?: string;
}

export const CADViewer: React.FC<CADViewerProps> = ({
  modelPath,
  title = "3D Model",
  format = 'gltf',
  width = "100%",
  height = "400px"
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // For Creo models, we'll need conversion or PTC's web viewer
  // For now, we'll use a placeholder that can be upgraded
  if (format === 'creo') {
    return (
      <div
        ref={viewerRef}
        style={{
          width,
          height,
          border: '2px solid #e1e4e8',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f6f8fa',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#6b7280'
          }}>
            🔧
          </div>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#1b1f23',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Creo Parametric Model
          </h3>
          <p style={{
            margin: '0 0 16px 0',
            color: '#586069',
            fontSize: '14px'
          }}>
            Interactive 3D model view coming soon
          </p>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            color: '#24292f',
            fontFamily: 'monospace'
          }}>
            {modelPath}
          </div>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            PTC Creo View integration planned for Q1 2025
          </div>
        </div>
      </div>
    );
  }

  // For standard 3D formats, use the ModelViewer component
  return (
    <div style={{ width, height }}>
      <ModelViewer
        modelPath={modelPath}
        title={title}
        format={format}
      />
    </div>
  );
};
