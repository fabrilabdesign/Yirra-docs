import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import HowWeWork from './components/HowWeWork'
import Projects from './components/Projects'
import ContactBar from './components/ContactBar'

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HowWeWork />
        <Projects />
        <ContactBar />
      </main>
    </>
  )
}

export default App
