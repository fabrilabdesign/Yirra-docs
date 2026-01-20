import React, { useEffect, useRef, useState } from 'react';
import styles from './ModelViewer.module.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          'camera-controls'?: boolean;
          'touch-action'?: string;
          'auto-rotate'?: boolean;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          exposure?: string;
          'environment-image'?: string;
          'camera-orbit'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'interaction-prompt'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          ar?: boolean;
          'ar-modes'?: string;
          'animation-name'?: string;
          'time-scale'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ModelViewerProps {
  modelPath: string;
  title?: string;
  description?: string;
  format?: 'gltf' | 'glb' | 'obj' | 'stl';
  width?: string;
  height?: string;
  poster?: string;
  showWireframeToggle?: boolean;
  showFullscreenToggle?: boolean;
  autoRotate?: boolean;
  environmentImage?: string;
  exposure?: string;
  shadowIntensity?: string;
  shadowSoftness?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  title = "3D Model",
  description,
  format = 'glb',
  width = "100%",
  height = "500px",
  poster,
  showWireframeToggle = true,
  showFullscreenToggle = true,
  autoRotate = true,
  environmentImage = "https://modelviewer.dev/shared-assets/environments/aircraft_workshop_01_1k.hdr",
  exposure = "0.4",
  shadowIntensity = "0",
  shadowSoftness = "0"
}) => {
  const viewerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Load model-viewer script dynamically (v4.x from Google CDN)
    if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      script.type = 'module';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadProgress(100);
    };

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ totalProgress: number }>;
      setLoadProgress(Math.round(customEvent.detail.totalProgress * 100));
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('progress', handleProgress);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('progress', handleProgress);
    };
  }, []);

  // Helper to access internal Three.js scene
  const getScene = (mv: any) => {
    const symbols = Object.getOwnPropertySymbols(mv);
    const sceneSymbol = symbols.find(s => s.description === 'scene');
    return sceneSymbol ? mv[sceneSymbol] : null;
  };

  const toggleWireframe = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const newWireframeState = !isWireframe;
    setIsWireframe(newWireframeState);

    const scene = getScene(viewer);
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // Store original color if not stored
          if (!child.userData.originalColor && child.material.color) {
            child.userData.originalColor = child.material.color.getHex();
          }
          
          child.material.wireframe = newWireframeState;
          if (newWireframeState) {
            child.material.color?.setHex(0x0ea5e9); // Use theme primary color
          } else if (child.userData.originalColor) {
            child.material.color?.setHex(child.userData.originalColor);
          }
          child.material.needsUpdate = true;
        }
      });
      (viewer as any).requestUpdate?.();
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const resetCamera = () => {
    const viewer = viewerRef.current as any;
    if (viewer?.resetTurntableRotation) {
      viewer.resetTurntableRotation();
    }
    // Reset to default orbit
    if (viewer) {
      viewer.cameraOrbit = '0deg 75deg auto';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={styles.viewerContainer}
      style={{ 
        width,
        '--viewer-height': isFullscreen ? '100vh' : height 
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className={styles.viewerHeader}>
        <div className={styles.headerInfo}>
          <h3 className={styles.viewerTitle}>{title}</h3>
          {description && <p className={styles.viewerDescription}>{description}</p>}
        </div>
        <div className={styles.headerBadge}>
          <span className={styles.badge}>GLB</span>
          <span className={styles.badge}>Interactive</span>
        </div>
      </div>

      {/* Model Viewer */}
      <div className={styles.viewerWrapper}>
        <model-viewer
          ref={viewerRef as React.LegacyRef<HTMLElement>}
          src={modelPath}
          alt={title}
          poster={poster}
          camera-controls
          touch-action="pan-y"
          auto-rotate={autoRotate}
          rotation-per-second="12deg"
          shadow-intensity={shadowIntensity}
          shadow-softness={shadowSoftness}
          exposure={exposure}
          environment-image={environmentImage}
          camera-orbit="30deg 70deg auto"
          min-camera-orbit="auto auto 50%"
          max-camera-orbit="auto auto 300%"
          interaction-prompt="auto"
          loading="eager"
          ar
          ar-modes="webxr scene-viewer quick-look"
          style={{
            width: '100%',
            height: 'var(--viewer-height)',
            background: 'radial-gradient(ellipse at center, #0a1520 0%, #060809 40%, #050505 100%)'
          }}
        >
          {/* Loading overlay */}
          {!isLoaded && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <span className={styles.loadingText}>Loading 3D Model...</span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${loadProgress}%` }}
                  ></div>
                </div>
                <span className={styles.progressText}>{loadProgress}%</span>
              </div>
            </div>
          )}

          {/* AR Button */}
          <button
            slot="ar-button"
            className={styles.arButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            View in AR
          </button>
        </model-viewer>

        {/* Control buttons overlay */}
        <div className={styles.controlsOverlay}>
          {showWireframeToggle && (
            <button 
              className={`${styles.controlButton} ${isWireframe ? styles.active : ''}`}
              onClick={toggleWireframe}
              title={isWireframe ? 'Show Solid' : 'Show Wireframe'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <path d="M12 22V12"/>
                <path d="M2 7v10"/>
                <path d="M22 7v10"/>
              </svg>
              <span>{isWireframe ? 'Solid' : 'Wireframe'}</span>
            </button>
          )}
          
          <button 
            className={styles.controlButton}
            onClick={resetCamera}
            title="Reset View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Reset</span>
          </button>

          {showFullscreenToggle && (
            <button 
              className={styles.controlButton}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          )}
        </div>

        {/* Interaction hint */}
        {isLoaded && (
          <div className={styles.interactionHint}>
            <span>🖱️ Drag to rotate • Scroll to zoom • Shift+drag to pan</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelViewer;
