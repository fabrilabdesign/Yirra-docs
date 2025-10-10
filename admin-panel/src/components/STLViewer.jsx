import getApiUrl from '../utils/api.js';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAuth } from '@clerk/clerk-react';

/**
 * STL Viewer Component
 * Renders 3D STL files using Three.js in the browser
 */
const STLViewer = ({ 
  stlUrl, 
  fileId, 
  fileName,
  width = 400, 
  height = 300, 
  showControls = false,
  autoRotate = false,
  wireframe = false,
  backgroundColor = '#f0f0f0',
  initialOrientation = { x: 0, y: 0, z: 0 },
  onOrientationChange
}) => {
  const { getToken } = useAuth();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate);

  useEffect(() => {
    let scene, camera, renderer, controls, mesh;
    let isMounted = true;

    const initThreeJS = async () => {
      try {
        // Early validation - ensure stlUrl is provided
        if (!stlUrl) {
          setError('No STL file URL provided');
          setLoading(false);
          return;
        }

        // Dynamically import Three.js to avoid SSR issues
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');

        if (!isMounted) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(backgroundColor);
        sceneRef.current = scene;

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 50);
        cameraRef.current = camera;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        // Clear any existing content
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
          mountRef.current.appendChild(renderer.domElement);
        }

        // Controls setup
        if (showControls) {
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.1;
          controls.enableZoom = true;
          controls.autoRotate = autoRotateEnabled;
          controls.autoRotateSpeed = 2.0;
        }

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 1, 1);
        directionalLight1.castShadow = true;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-1, -1, -1);
        scene.add(directionalLight2);

        // Load STL file with authentication if needed
        const loader = new STLLoader();
        
        // Check if this is an admin endpoint that needs authentication
        const isAdminEndpoint = stlUrl && stlUrl.includes(getApiUrl('/api/admin/'));
        
        if (isAdminEndpoint) {
          // Fetch with authentication headers first
          try {
            const token = await getToken();
            if (!token) {
              throw new Error('Authentication required for admin STL files');
            }
            const response = await fetch(stlUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to load STL file: ${response.status}`);
            }
            
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            loader.load(
              objectUrl,
              (geometry) => {
                if (!isMounted) return;
                handleSTLGeometry(geometry);
                // Clean up the object URL
                URL.revokeObjectURL(objectUrl);
              },
              (progress) => {
                console.log('STL loading progress:', (progress.loaded / progress.total) * 100 + '%');
              },
              (error) => {
                console.error('STL loading error:', error);
                setError('Failed to load STL file');
                setLoading(false);
                URL.revokeObjectURL(objectUrl);
              }
            );
          } catch (fetchError) {
            console.error('STL fetch error:', fetchError);
            setError('Failed to fetch STL file');
            setLoading(false);
          }
        } else {
          // Direct load for non-admin endpoints
          loader.load(
            stlUrl,
            (geometry) => {
              if (!isMounted) return;
              handleSTLGeometry(geometry);
            },
            (progress) => {
              console.log('STL loading progress:', (progress.loaded / progress.total) * 100 + '%');
            },
            (error) => {
              console.error('STL loading error:', error);
              setError('Failed to load STL file');
              setLoading(false);
            }
          );
        }

        // Helper function to handle STL geometry processing
        function handleSTLGeometry(geometry) {
          // Center the geometry
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);

          // Scale to fit in view
          const size = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = 40 / maxDimension;
          geometry.scale(scale, scale, scale);

          // Create material
          const material = new THREE.MeshLambertMaterial({
            color: 0x3b82f6,
            wireframe: wireframe,
            transparent: true,
            opacity: 0.9
          });

          // Create mesh
          mesh = new THREE.Mesh(geometry, material);
          mesh.receiveShadow = true;
          mesh.castShadow = true;
          
          // Apply initial orientation if provided (convert degrees to radians)
          if (initialOrientation) {
            mesh.rotation.set(
              (initialOrientation.x || 0) * (Math.PI / 180),
              (initialOrientation.y || 0) * (Math.PI / 180),
              (initialOrientation.z || 0) * (Math.PI / 180)
            );
          }
          
          scene.add(mesh);

          setLoading(false);
          setError(null);
        }

        // Animation loop
        const animate = () => {
          if (!isMounted) return;

          animationRef.current = requestAnimationFrame(animate);

          if (controls) {
            controls.update();
          }

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!isMounted || !renderer || !camera) return;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          isMounted = false;
          window.removeEventListener('resize', handleResize);
          
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          
          if (controls) {
            controls.dispose();
          }
          
          if (renderer) {
            renderer.dispose();
          }
          
          if (scene) {
            scene.clear();
          }
          
          if (mountRef.current && renderer) {
            mountRef.current.removeChild(renderer.domElement);
          }
        };

      } catch (err) {
        console.error('Error initializing Three.js:', err);
        setError('Failed to initialize 3D viewer');
        setLoading(false);
      }
    };

    initThreeJS();

    return () => {
      isMounted = false;
    };
  }, [stlUrl, width, height, showControls, backgroundColor]);

  // Update wireframe when toggled
  useEffect(() => {
    if (sceneRef.current) {
      const mesh = sceneRef.current.children.find(child => child.type === 'Mesh');
      if (mesh && mesh.material) {
        mesh.material.wireframe = wireframe;
      }
    }
  }, [wireframe]);

  // Update auto-rotate when toggled
  useEffect(() => {
    if (sceneRef.current) {
      // This would be handled by OrbitControls if available
      setAutoRotateEnabled(autoRotateEnabled);
    }
  }, [autoRotateEnabled]);

  // Expose rotation functions globally with orientation callback
  useEffect(() => {
    window.stlViewerRotate = (action) => {
      if (!sceneRef.current) return;
      
      const mesh = sceneRef.current.children.find(child => child.type === 'Mesh');
      if (!mesh) return;

      switch (action) {
        case 'flipX':
          mesh.rotation.x += Math.PI;
          break;
        case 'flipY':
          mesh.rotation.y += Math.PI;
          break;
        case 'rotate90':
          mesh.rotation.z += Math.PI / 2;
          break;
        case 'reset':
          mesh.rotation.set(0, 0, 0);
          // Center the mesh
          if (mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            mesh.geometry.boundingBox.getCenter(center);
            mesh.position.copy(center).multiplyScalar(-1);
          }
          break;
        default:
          break;
      }
      
      // Re-render the scene
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      // Notify parent component of orientation change
      if (onOrientationChange) {
        onOrientationChange({
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z
        });
      }
    };

    // Function to get current orientation
    window.getSTLOrientation = () => {
      if (!sceneRef.current) return { x: 0, y: 0, z: 0 };
      
      const mesh = sceneRef.current.children.find(child => child.type === 'Mesh');
      if (!mesh) return { x: 0, y: 0, z: 0 };
      
      return {
        x: mesh.rotation.x,
        y: mesh.rotation.y,
        z: mesh.rotation.z
      };
    };

    return () => {
      delete window.stlViewerRotate;
    };
  }, []);

  const downloadSTL = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required for STL download');
        return;
      }
      const response = await fetch(`/api/admin/stl-files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const resetView = () => {
    // Reset camera position and controls
    if (sceneRef.current && rendererRef.current) {
      // This would reset the camera to default position
      window.location.reload(); // Simple reset for now
    }
  };

  return (
    <div className="stl-viewer">
      <div className="viewer-container" style={{ width, height }}>
        {loading && (
          <div className="viewer-loading">
            <div className="loading-spinner"></div>
            <span>Loading 3D model...</span>
          </div>
        )}
        
        {error && (
          <div className="viewer-error">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        )}
        
        <div ref={mountRef} className="viewer-mount" />
        
        {showControls && !loading && !error && (
          <div className="viewer-controls">
            <div className="control-group">
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`control-btn ${wireframe ? 'active' : ''}`}
                title="Toggle wireframe"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              
              <button
                onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
                className={`control-btn ${autoRotateEnabled ? 'active' : ''}`}
                title="Toggle auto-rotate"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button
                onClick={resetView}
                className="control-btn"
                title="Reset view"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </button>
              
              <button
                onClick={downloadSTL}
                className="control-btn download"
                title="Download STL"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .stl-viewer {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border: 1px solid rgba(56, 68, 82, 0.3);
        }

        .viewer-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .viewer-mount {
          width: 100%;
          height: 100%;
        }

        .viewer-loading,
        .viewer-error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #94a3b8;
          z-index: 10;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .viewer-error svg {
          width: 32px;
          height: 32px;
          color: #f87171;
        }

        .retry-btn {
          padding: 6px 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 4px;
          color: #3b82f6;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .viewer-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 20;
        }

        .control-group {
          display: flex;
          gap: 6px;
          background: rgba(0, 0, 0, 0.7);
          padding: 6px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
        }

        .control-btn {
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .control-btn.active {
          background: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.5);
        }

        .control-btn.download {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.2);
        }

        .control-btn.download:hover {
          background: rgba(52, 211, 153, 0.2);
          color: #34d399;
        }

        .control-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .viewer-controls {
            top: 6px;
            right: 6px;
          }

          .control-group {
            padding: 4px;
          }

          .control-btn {
            width: 28px;
            height: 28px;
          }

          .control-btn svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default STLViewer;