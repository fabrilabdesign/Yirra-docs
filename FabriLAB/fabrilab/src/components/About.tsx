import React from 'react'

const About: React.FC = () => {
  return (
    <section id="about" className="fl-section fl-about">
      <div className="fl-section-heading">
        <h2>About FabriLab</h2>
      </div>
      <div className="fl-about-body">
        <div>
          <p>
            FabriLab is a Melbourne-based architectural metalwork practice.
          </p>
          <p>
            We support architects, builders and fit-out teams with CAD detailing, sheet metal fabrication and site-ready documentation.
          </p>
        </div>
        <div className="fl-about-list">
          <h3>Design Services</h3>
          <ul>
            <li>Precision sheet metal design</li>
            <li>Architectural facade design</li>
            <li>Powder coating specifications</li>
            <li>Structural metalwork design</li>
            <li>CAD modeling & documentation</li>
            <li>Design for manufacturability</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default About
