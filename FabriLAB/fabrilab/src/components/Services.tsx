import React from 'react'

const Services: React.FC = () => {
  return (
    <section id="services" className="fl-section fl-services">
      <div className="fl-section-heading">
        <h2>Services</h2>
      </div>
      <div className="fl-services-grid">
        <div className="fl-service-card">
          <h3>Architectural metalwork</h3>
          <p>Façade panels, folded elements, reveals, trims, brackets.</p>
        </div>
        <div className="fl-service-card">
          <h3>Ceiling + soffit systems</h3>
          <p>Floating/suspended ceilings, access solutions, coordination with services.</p>
        </div>
        <div className="fl-service-card">
          <h3>CAD-to-fabrication</h3>
          <p>3D detailing, shop drawings, cutting files, revision control.</p>
        </div>
      </div>
    </section>
  )
}

export default Services
