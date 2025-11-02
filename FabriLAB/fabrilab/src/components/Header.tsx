import React from 'react'

const Header: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="fl-header fl-header-floating">
      <div className="fl-header-shell">
        <div className="fl-brand" onClick={() => scrollTo('hero')}>
          <img src="/fabrilab-logo.png" alt="FabriLAB" className="fl-logo" />
        </div>

        <div className="fl-header-actions">
          <button className="fl-cta" onClick={() => scrollTo('contact')}>
            Contact us
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
