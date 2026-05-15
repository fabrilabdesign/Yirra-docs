import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { DISCORD_INVITE_URL } from '@site/src/discordInvite';
import SupplementalLipoBracketCta from '@site/src/components/SupplementalLipoBracketCta';
import CommercialProgramsPipeline from '@site/src/components/CommercialProgramsPipeline';
import { ModelViewer } from '@site/src/components/ModelViewer';
import styles from './index.module.css';

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  );
}

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
            poster="/img/hero/new_hero_1200.jpg"
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src="/videos/hero-drone.mp4" type="video/mp4" />
          </video>
        )}
        {/* Fallback image for reduced motion or before video loads */}
        <img 
          src="/img/hero/new_hero_1200.jpg"
          srcSet="/img/hero/new_hero_800.webp 800w, /img/hero/new_hero_1200.webp 1200w, /img/hero/new_hero_2400.webp 2400w"
          sizes="100vw"
          alt="Replicant GEN 1 Drone" 
          fetchPriority="high"
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
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnDiscord}
          >
            <DiscordGlyph />
            <span>Join Discord</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
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
        <p className={styles.heroDiscordTagline}>
          Build help, print tuning, and mods — same day from people flying Replicant.
        </p>
        
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

function DiscordCommunityBand() {
  return (
    <section className={styles.discordBand} aria-labelledby="discord-band-heading">
      <div className={styles.discordBandGlow} />
      <div className={styles.discordBandInner}>
        <div className={styles.discordBandCopy}>
          <span className={styles.discordBandEyebrow}>Community</span>
          <h2 id="discord-band-heading">Skip the guesswork</h2>
          <p>
            Stuck on a print, epoxy cure, or tune? The Discord is where builders share fixes, STLs, and flight
            logs — fast feedback from people who already built it.
          </p>
          <ul className={styles.discordBandList}>
            <li>#build-help and assembly threads</li>
            <li>Mod ideas and remixes</li>
            <li>iNav / tune discussion</li>
          </ul>
        </div>
        <div className={styles.discordBandActions}>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordBandButton}
          >
            <DiscordGlyph />
            <span>Open Discord invite</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
          <span className={styles.discordBandMicro}>
            Free · {DISCORD_INVITE_URL.replace(/^https?:\/\//, '')}
          </span>
        </div>
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
      <div className={styles.batterySupplementSlot}>
        <SupplementalLipoBracketCta />
        <CommercialProgramsPipeline compact />
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
            <span>Pre-tuned 3MF print projects</span>
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
        
        {/* Release Bundle Callout */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: 'rgba(59, 130, 246, 0.08)', 
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>🎯 New to drone building?</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', opacity: 0.9 }}>
            Get our <strong>Replicant Release Bundle</strong> with all Yirra custom parts: carbon plates, battery, PMB, and fasteners in one package.
          </p>
          <a 
            href="https://yirrasystems.com/product/prod_TqcqCXEB6vE8m6" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: '500',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            🛒 View Release Bundle ($369 AUD)
          </a>
        </div>

        <div className={styles.closingCtaRow}>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnDiscord}
          >
            <DiscordGlyph />
            <span>Join Discord</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
          <Link to="/docs/platform" className={styles.btnPrimary}>
            <span>Explore the Platform</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
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
        <DiscordCommunityBand />
        <ModelSection />
        <ExplodedSection />
        <BatterySystemSection />
        <PrintabilitySection />
        <ClosingSection />
      </main>
    </Layout>
  );
}
