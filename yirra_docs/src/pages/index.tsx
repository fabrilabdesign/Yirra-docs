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
        modelPath="/files/3d-models/IC-01.glb"
        title="Replicant GEN 1"
        description="Rotate, zoom, and explore the complete drone assembly"
        height="600px"
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
            src="/img/drone/Explode_view.png" 
            alt="Exploded view of Replicant GEN 1"
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

function ArmAssemblySection() {
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
            <span>Critical Assembly</span>
            <span className={styles.labelLine} />
          </div>
          <h2>Arm Assembly</h2>
          <p className={styles.armDescription}>
            Each arm consists of a carbon fiber tube bonded between a motor mount and arm boss using 3M DP-409 epoxy. This creates an incredibly rigid structure that transfers thrust directly to the frame.
          </p>
          <Link to="/docs/arm-bonding" className={styles.btnPrimary}>
            <span>View Bonding Guide</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className={styles.armImage}>
          <div className={styles.imageGlow} />
          <img 
            src="/img/drone/iso_arm_explode_2.png" 
            alt="Arm assembly exploded view"
          />
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const items = [
    { src: '/img/drone/Carbon_frame.gif', label: 'Carbon Frame' },
    { src: '/img/drone/Chassis.gif', label: 'Chassis Core' },
    { src: '/img/drone/Battery_removal.gif', label: 'Battery System' },
    { src: '/img/drone/Digital_forge.gif', label: 'Digital Design' },
    { src: '/img/drone/Flight_footage.gif', label: 'Flight Performance' },
    { src: '/img/drone/super-stable-flight-12.gif', label: 'Stable Flight' },
  ];

  return (
    <section ref={sectionRef} className={`${styles.gallerySection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.sectionLabel}>
        <span className={styles.labelLine} />
        <span>In Motion</span>
        <span className={styles.labelLine} />
      </div>
      <div className={styles.galleryGrid}>
        {items.map((item, index) => (
          <div 
            key={item.label} 
            className={styles.galleryItem}
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <img src={item.src} alt={item.label} />
            <div className={styles.galleryLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickLinksSection() {
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

  const links = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      title: 'Downloads',
      desc: 'STL, 3MF, and STEP files',
      link: '/docs/downloads',
      cta: 'Get Files',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
      title: 'Purchase',
      desc: 'Electronics and carbon fiber',
      link: '/docs/bom',
      cta: 'Component List',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      title: 'Arm Bonding',
      desc: 'DP-409 epoxy workflow',
      link: '/docs/arm-bonding',
      cta: 'Build Guide',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <path d="M9 9h6v6H9z"/>
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
        </svg>
      ),
      title: 'Nylon Printing',
      desc: 'Drying and handling',
      link: '/docs/nylon-printing',
      cta: 'Print Guide',
    },
  ];

  return (
    <section ref={sectionRef} className={`${styles.quickLinksSection} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>
          <span className={styles.labelLine} />
          <span>Quick Access</span>
          <span className={styles.labelLine} />
        </div>
        <h2>Start Building</h2>
        <p>Everything you need to bring Replicant to life</p>
      </div>
      <div className={styles.quickLinks}>
        {links.map((item, index) => (
          <Link 
            key={item.title} 
            to={item.link} 
            className={styles.linkCard}
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardIcon}>{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <span className={styles.cardCta}>
              {item.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        ))}
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
        <ArmAssemblySection />
        <GallerySection />
        <QuickLinksSection />
      </main>
    </Layout>
  );
}
