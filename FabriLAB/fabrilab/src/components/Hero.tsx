import React from 'react'

const Hero: React.FC = () => {
  return (
    <section id="hero" className="fl-hero">
      <video
        className="fl-hero-video"
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fl-hero-overlay" />
      <div className="fl-hero-content">
        <p className="fl-hero-subtitle">
          Architectural sheet metal, detailed in CAD, built in Melbourne.
        </p>
        <p className="fl-hero-subline">
          Façades, floating ceilings, feature metalwork. We translate architect intent into installable, repeatable parts.
        </p>
        <div className="fl-hero-actions">
          <a href="#contact" className="fl-primary-btn">
            → Start a project
          </a>
          <div className="fl-hero-small-text">
            DWG / RVT / STEP accepted.
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
