import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { ModelViewer } from '@site/src/components/ModelViewer';
import styles from './index.module.css';

function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section className={styles.hero}>
      {/* Video Background */}
      <div className={styles.videoContainer}>
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            className={`${styles.heroVideo} ${videoLoaded ? styles.videoLoaded : ''}`}
            autoPlay
            muted
            loop
            playsInline
            poster="/img/hero/hero-poster.png"
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src="/videos/hero-drone.mp4" type="video/mp4" />
          </video>
        )}
        {/* Fallback image for reduced motion or before video loads */}
        <img 
          src="/img/hero/hero-poster.png" 
          alt="Replicant GEN 1 Drone" 
          className={`${styles.heroPoster} ${videoLoaded && !prefersReducedMotion ? styles.posterHidden : ''}`}
        />
        {/* Video overlay gradient */}
        <div className={styles.videoOverlay} />
      </div>

      {/* Animated gradient orbs */}
      <div 
        className={styles.gradientOrb1} 
        style={{ 
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` 
        }}
      />
      <div 
        className={styles.gradientOrb2}
        style={{ 
          transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)` 
        }}
      />
      <div className={styles.gradientOrb3} />
      
      {/* Grid pattern overlay */}
      <div className={styles.gridPattern} />
      
      {/* Scanlines effect */}
      <div className={styles.scanlines} />
      
      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ 
            '--delay': `${i * 0.5}s`,
            '--x': `${Math.random() * 100}%`,
            '--duration': `${15 + Math.random() * 10}s`
          } as React.CSSProperties} />
        ))}
      </div>

      <div className={styles.heroContent}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Open Source</span>
        </div>
        
        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine}>Replicant</span>
          <span className={styles.titleAccent}>GEN 1</span>
        </h1>
        
        <p className={styles.heroSubtitle}>
          The open-source 7" FPV platform engineered for builders who demand precision.
        </p>
        
        <div className={styles.heroCta}>
          <Link to="/docs/platform" className={styles.btnPrimary}>
            <span>Platform Overview</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </Link>
          <Link to="/docs/downloads" className={styles.btnPrimary}>
            <span>Download Files</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </Link>
          <Link to="/docs/bom" className={styles.btnSecondary}>
            <span>Purchase Parts</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>7"</span>
            <span className={styles.statLabel}>Prop Size</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>CF-Nylon</span>
            <span className={styles.statLabel}>3D Printed</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>Open</span>
            <span className={styles.statLabel}>Source</span>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}

function ModelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.modelSection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.sectionLabel}>
        <span className={styles.labelLine} />
        <span>Interactive Model</span>
        <span className={styles.labelLine} />
      </div>
      <ModelViewer
        modelPath="/files/3d-models/Replicant_Gen1.glb"
        title="Replicant GEN 1"
        description="Rotate, zoom, and explore the complete drone assembly"
        height="750px"
        showWireframeToggle={true}
        showFullscreenToggle={true}
        autoRotate={true}
      />
    </section>
  );
}

function ExplodedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { num: '01', title: '3D Printed Chassis', desc: 'CF-Nylon construction for strength and durability' },
    { num: '02', title: 'Bonded Carbon Arms', desc: 'DP-409 epoxy joints for rigid, precise alignment' },
    { num: '03', title: 'Modular Battery Rail', desc: 'Hot-swap system with repeatable CG positioning' },
    { num: '04', title: 'Carbon Fiber Plates', desc: 'Top plate, bottom plate, and spine reinforcement' },
  ];

  return (
    <section ref={sectionRef} className={`${styles.explodedSection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>
          <span className={styles.labelLine} />
          <span>Assembly Overview</span>
          <span className={styles.labelLine} />
        </div>
        <h2>Built for Precision</h2>
        <p>Every component engineered for optimal performance</p>
      </div>
      <div className={styles.explodedGrid}>
        <div className={styles.explodedImage}>
          <div className={styles.imageGlow} />
          <img 
            src="/img/Drone_updates/Hero_ALT.png" 
            alt="Replicant GEN 1 overview"
          />
        </div>
        <div className={styles.explodedContent}>
          {features.map((feature, index) => (
            <div 
              key={feature.num} 
              className={styles.featureItem}
              style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
            >
              <span className={styles.featureNum}>{feature.num}</span>
              <div className={styles.featureText}>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BatterySystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.armSection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.armGrid}>
        <div className={styles.armContent}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Modular Power</span>
            <span className={styles.labelLine} />
          </div>
          <h2>Rail-Mounted Battery System</h2>
          <p className={styles.armDescription}>
            No more velcro straps. Our rail-mounted system enables rapid, repeatable battery swaps with consistent CG positioning. The underslung mass dampens vibrations and improves flight characteristics.
          </p>
          <div className={styles.featureList}>
            <span>5000mAh Molicel P50B cells</span>
            <span>Sub-second swaps</span>
            <span>Integrated balance leads</span>
          </div>
        </div>
        <div className={styles.armImage}>
          <div className={styles.imageGlow} />
          <img 
            src="/img/drone/Battery_removal.gif" 
            alt="Rail-mounted battery swap system"
          />
        </div>
      </div>
    </section>
  );
}

function PrintabilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.armSection} ${styles.reversed} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.armGrid}>
        <div className={styles.armContent}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Builder Accessible</span>
            <span className={styles.labelLine} />
          </div>
          <h2>3D Printed. Repairable. Yours.</h2>
          <p className={styles.armDescription}>
            The entire chassis prints in CF-Nylon on consumer-grade printers. Crash an arm? Print another. Want to modify the frame? The CAD is yours. No waiting for shipping, no proprietary lock-in.
          </p>
          <div className={styles.featureList}>
            <span>Full STEP files included</span>
            <span>Bambu-ready 3MF configs</span>
            <span>Strategic carbon reinforcement</span>
          </div>
        </div>
        <div className={styles.armImage}>
          <div className={styles.imageGlow} />
          <img 
            src="/img/Drone_updates/Carbon where it counts.png" 
            alt="Hybrid carbon and 3D printed construction"
          />
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.closingSection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.closingContent}>
        <h2>Every file. Every detail. Yours to build.</h2>
        <p>Full CAD, print configs, assembly guides, and firmware — everything you need to build, modify, and repair.</p>
        <Link to="/docs/platform" className={styles.btnPrimary}>
          <span>Explore the Platform</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </section>
  );
}


export default function Home(): JSX.Element {
  return (
    <Layout
      title="Replicant GEN 1"
      description="Open-source 7-inch FPV drone platform with 3D printable chassis">
      <main className={styles.main}>
        <HeroSection />
        <ModelSection />
        <ExplodedSection />
        <BatterySystemSection />
        <PrintabilitySection />
        <ClosingSection />
      </main>
    </Layout>
  );
}
