import React, { useState, useEffect } from 'react';

interface ImageToggleProps {
  solidImage: string;
  hiddenLineImage: string;
  altText: string;
  buttonText?: string;
  title?: string;
}

const ImageToggle: React.FC<ImageToggleProps> = ({
  solidImage,
  hiddenLineImage,
  altText,
  buttonText,
  title
}) => {
  const [isSolid, setIsSolid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSolid(!isSolid);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const currentImage = isSolid ? solidImage : hiddenLineImage;

  return (
    <>
      {/* Thumbnail Card */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
          border: '1px solid #262626',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.15)';
          e.currentTarget.style.borderColor = '#0ea5e9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#262626';
        }}
        onClick={openModal}
      >
        {/* Image Container */}
        <div style={{ 
          position: 'relative', 
          padding: '16px',
          background: '#141414'
        }}>
          <img
            src={currentImage}
            alt={altText}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              display: 'block',
            }}
          />
          
          {/* Expand Icon Overlay */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '40px',
            height: '40px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </div>
        </div>

        {/* Card Footer */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
          borderTop: '1px solid #262626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '4px',
            }}>
              {title || altText}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#737373',
            }}>
              Click to expand • Press to toggle view
            </div>
          </div>
          
          {/* Toggle Indicator */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleImage();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: isSolid 
                ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {isSolid ? 'Solid' : 'X-Ray'}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '40px',
          }}
          onClick={closeModal}
        >
          {/* Modal Content Container */}
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '20px',
              padding: '0 8px',
            }}>
              {/* Title */}
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
              }}>
                {title || altText}
              </div>
              
              {/* Toggle Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '30px',
                padding: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <button
                  onClick={() => setIsSolid(true)}
                  style={{
                    padding: '10px 20px',
                    background: isSolid 
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' 
                      : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                  Solid View
                </button>
                <button
                  onClick={() => setIsSolid(false)}
                  style={{
                    padding: '10px 20px',
                    background: !isSolid 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                      : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="3" y1="3" x2="21" y2="21"/>
                  </svg>
                  X-Ray View
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ✕
              </button>
            </div>

            {/* Image Container */}
            <div style={{
              position: 'relative',
              background: '#0a0a0a',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #262626',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            }}>
              <img
                src={currentImage}
                alt={altText}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 140px)',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
              
              {/* View Type Badge */}
              <div style={{
                position: 'absolute',
                bottom: '32px',
                left: '32px',
                padding: '8px 16px',
                background: isSolid 
                  ? 'rgba(14, 165, 233, 0.9)' 
                  : 'rgba(139, 92, 246, 0.9)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {isSolid ? '● Solid View' : '○ X-Ray View'}
              </div>
            </div>

            {/* Keyboard Hint */}
            <div style={{
              marginTop: '16px',
              fontSize: '0.75rem',
              color: '#525252',
            }}>
              Press <kbd style={{ 
                padding: '2px 8px', 
                background: '#262626', 
                borderRadius: '4px',
                border: '1px solid #404040',
                fontFamily: 'monospace',
              }}>ESC</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageToggle;
