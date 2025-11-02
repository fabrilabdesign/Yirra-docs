import React from 'react'

const projects = [
  {
    title: 'Custom Security Enclosure Design',
    desc: 'Precision sheet metal security housing design with reinforced locking mechanism and weather-resistant finish specifications.',
    tag: 'Sheet metal / Security',
  },
  {
    title: 'Architectural Facade System Design',
    desc: 'Custom powder-coated metal panel designs for modern architectural installations with structural integrity requirements.',
    tag: 'Architectural / Powder coating',
  },
  {
    title: 'Industrial Equipment Housing Design',
    desc: 'Heavy-duty sheet metal enclosure designs for industrial applications with ventilation and access feature specifications.',
    tag: 'Industrial / Fabrication',
  },
]

const Projects: React.FC = () => {
  return (
    <section id="projects" className="fl-section fl-projects">
      <div className="fl-section-heading">
        <h2>Selected Projects</h2>
        <p>Hardware and enclosures built to withstand real use.</p>
      </div>
      <div className="fl-project-grid">
        {projects.map((p) => (
          <article key={p.title} className="fl-project-card">
            <div className="fl-project-meta">{p.tag}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
            <button
              className="fl-project-link"
              onClick={() => {
                const el = document.getElementById('contact')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Discuss similar work →
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects
