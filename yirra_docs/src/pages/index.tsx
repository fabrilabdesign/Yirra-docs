import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="homepage-header">
      <div className="container">
        <div className="homepage-hero">
          <div className="homepage-hero-content">
            <div className="homepage-hero-text">
              <h1 className="homepage-title">
                Replicant GEN 1
              </h1>
              <p className="homepage-subtitle">
                Complete documentation for professional FPV drone building
              </p>
              <div className="homepage-nav">
                <Link to="/docs/build-guides/overview" className="nav-link primary">
                  Start Building →
                </Link>
                <Link to="/docs/stl-files" className="nav-link secondary">
                  Download Files
                </Link>
                <Link to="/docs/firmware" className="nav-link secondary">
                  Firmware Guide
                </Link>
              </div>
            </div>
            <div className="homepage-hero-image">
              <img
                src="/img/drone/Above_iso_hero.png"
                alt="Replicant GEN 1 Drone Platform"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PlatformCapabilities() {
  return (
    <section className="platform-section">
      <div className="container">
        <div className="section-header">
          <h2>Platform Capabilities</h2>
          <p>Engineered for professional FPV operations</p>
        </div>

        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-number">01</div>
            <h3>7-8" Propulsion</h3>
            <p>Optimized for long-range efficiency with 1500-1700KV motors</p>
          </div>

          <div className="capability-card">
            <div className="capability-number">02</div>
            <h3>DJI O4 Pro Ready</h3>
            <p>Professional HD video transmission with cinema-grade quality</p>
          </div>

          <div className="capability-card">
            <div className="capability-number">03</div>
            <h3>Modular Rails</h3>
            <p>Hot-swappable battery system with repeatable CG positioning</p>
          </div>

          <div className="capability-card">
            <div className="capability-number">04</div>
            <h3>Camera Isolation</h3>
            <p>Multi-stage vibration dampening for stable footage</p>
          </div>

          <div className="capability-card">
            <div className="capability-number">05</div>
            <h3>3D Printable</h3>
            <p>Complete open-source design with STL file library</p>
          </div>

          <div className="capability-card">
            <div className="capability-number">06</div>
            <h3>F7/H7 Compatible</h3>
            <p>Professional flight controller integration</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentationQuality() {
  return (
    <section className="documentation-section">
      <div className="container">
        <div className="section-header">
          <h2>What's Inside</h2>
          <p>Complete technical documentation for every aspect of building</p>
        </div>

        <div className="quality-features">
          <div className="quality-feature">
            <div className="quality-number">01</div>
            <div className="quality-content">
              <h3>Step-by-Step Assembly</h3>
              <p>Complete build procedures with dimensional callouts and acceptance criteria</p>
            </div>
          </div>

          <div className="quality-feature">
            <div className="quality-number">02</div>
            <div className="quality-content">
              <h3>Technical Specifications</h3>
              <p>Detailed component specifications, tolerances, and performance data</p>
            </div>
          </div>

          <div className="quality-feature">
            <div className="quality-number">03</div>
            <div className="quality-content">
              <h3>Firmware Configuration</h3>
              <p>Betaflight and INAV setup guides with tuning procedures</p>
            </div>
          </div>

          <div className="quality-feature">
            <div className="quality-number">04</div>
            <div className="quality-content">
              <h3>Troubleshooting Guides</h3>
              <p>Systematic problem-solving with diagnostic procedures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildProcess() {
  return (
    <section className="build-section">
      <div className="container">
        <div className="section-header">
          <h2>Build Process</h2>
          <p>Structured assembly sequence with quality checkpoints</p>
        </div>

        <div className="build-timeline">
          <div className="timeline-item">
            <div className="timeline-marker">1</div>
            <div className="timeline-content">
              <h3>Preparation</h3>
              <p>BOM verification, workspace setup, tool calibration</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">2</div>
            <div className="timeline-content">
              <h3>Fabrication</h3>
              <p>3D printing, carbon tube cutting, heat-set inserts</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">3</div>
            <div className="timeline-content">
              <h3>Electronics</h3>
              <p>FC configuration, ESC setup, power system assembly</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">4</div>
            <div className="timeline-content">
              <h3>Integration</h3>
              <p>Airframe assembly, cable routing, system testing</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">5</div>
            <div className="timeline-content">
              <h3>Optimization</h3>
              <p>Firmware tuning, flight testing, performance optimization</p>
            </div>
          </div>
        </div>

        <div className="build-cta">
          <Link to="/docs/build-guides/overview" className="button button--primary">
            Start Build Process →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Replicant GEN 1 Documentation"
      description="Professional 3D-printable FPV platform documentation with complete build guides and technical specifications">
      <HomepageHeader />
      <main>
        <PlatformCapabilities />
        <DocumentationQuality />
        <BuildProcess />
      </main>
    </Layout>
  );
}