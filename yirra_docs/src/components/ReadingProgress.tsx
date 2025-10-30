import React, { useEffect, useState } from 'react';

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    const throttledUpdateProgress = () => {
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', throttledUpdateProgress);
    updateProgress(); // Initial call

    return () => window.removeEventListener('scroll', throttledUpdateProgress);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3px',
        background: `linear-gradient(90deg, var(--ifm-color-primary), var(--ifm-color-primary-light))`,
        zIndex: 1000,
        transition: 'width 0.1s ease-out',
        borderRadius: '0 2px 2px 0',
      }}
    />
  );
};
