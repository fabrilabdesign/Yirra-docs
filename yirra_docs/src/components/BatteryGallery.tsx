import React, { useState, useEffect } from 'react';

interface BatteryImage {
  src: string;
  title: string;
  description: string;
}

const batteryImages: BatteryImage[] = [
  {
    src: '/img/Battery_pics/1.png',
    title: 'Battery System Overview',
    description: 'Complete battery assembly with rail mounting system'
  },
  {
    src: '/img/Battery_pics/2.png',
    title: 'Rail Mounting System',
    description: 'Quick-release rail system for rapid battery swaps'
  },
  {
    src: '/img/Battery_pics/3.png',
    title: 'Internal Construction',
    description: 'EVE 50 PL cells with pure nickel tabs and 10AWG wiring'
  },
  {
    src: '/img/Battery_pics/4.png',
    title: 'Protection Features',
    description: 'CF Nylon case with concealed balance connector'
  },
];

const BatteryGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft' && activeIndex > 0) setActiveIndex(activeIndex - 1);
      if (e.key === 'ArrowRight' && activeIndex < batteryImages.length - 1) setActiveIndex(activeIndex + 1);
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, activeIndex]);

  // Reset image loaded state when active index changes
  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

  const activeImage = batteryImages[activeIndex];

  return (
    <>
      {/* Gallery Container */}
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid #262626',
        borderRadius: '20px',
        padding: '24px',
        margin: '32px 0',
      }}>
        {/* Main Featured Image */}
        <div
          style={{
            position: 'relative',
            background: '#0a0a0a',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
            cursor: 'pointer',
            border: '1px solid #333',
            transition: 'all 0.3s ease',
          }}
          onClick={openModal}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0ea5e9';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(14, 165, 233, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            position: 'relative',
            paddingBottom: '66.67%', // 3:2 aspect ratio
            background: '#000',
          }}>
            <img
              src={activeImage.src}
              alt={activeImage.title}
              onLoad={() => setImageLoaded(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
            
            {/* Loading State */}
            {!imageLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#666',
              }}>
                Loading...
              </div>
            )}

            {/* Expand Icon */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '44px',
              height: '44px',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>

            {/* Image Counter Badge */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              padding: '6px 12px',
              background: 'rgba(14, 165, 233, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              {activeIndex + 1} / {batteryImages.length}
            </div>
          </div>

          {/* Image Info */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
            borderTop: '1px solid #262626',
          }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '6px',
            }}>
              {activeImage.title}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#999',
            }}>
              {activeImage.description}
            </div>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          {batteryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                position: 'relative',
                padding: 0,
                border: activeIndex === index 
                  ? '2px solid #0ea5e9' 
                  : '2px solid transparent',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#0a0a0a',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (activeIndex !== index) {
                  e.currentTarget.style.borderColor = '#444';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeIndex !== index) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{
                position: 'relative',
                paddingBottom: '75%', // 4:3 aspect ratio
              }}>
                <img
                  src={image.src}
                  alt={image.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: activeIndex === index ? 'none' : 'brightness(0.6)',
                    transition: 'filter 0.3s ease',
                  }}
                />
                
                {/* Active Indicator */}
                {activeIndex === index && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    background: '#0ea5e9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Hint */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#666',
        }}>
          Click thumbnails to view • Click main image to enlarge
        </div>
      </div>

      {/* Lightbox Modal */}
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
            padding: '20px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              padding: '0 8px',
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
              }}>
                {activeImage.title}
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Image Container */}
            <div style={{
              position: 'relative',
              background: '#0a0a0a',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #333',
            }}>
              <img
                src={activeImage.src}
                alt={activeImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 120px)',
                  display: 'block',
                  margin: '0 auto',
                }}
              />

              {/* Navigation Arrows */}
              {activeIndex > 0 && (
                <button
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
              )}
              
              {activeIndex < batteryImages.length - 1 && (
                <button
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom Info */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#999',
                marginBottom: '8px',
              }}>
                {activeImage.description}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#666',
              }}>
                {activeIndex + 1} of {batteryImages.length} • Use arrow keys to navigate • ESC to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatteryGallery;
