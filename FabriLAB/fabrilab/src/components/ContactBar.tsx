import React, { useState } from 'react'

const ContactBar: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    project: '',
    message: '',
    files: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({
      ...formData,
      files: files
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('company', formData.company)
      formDataToSend.append('project', formData.project)
      formDataToSend.append('message', formData.message)

      // Add files
      formData.files.forEach((file) => {
        formDataToSend.append(`files`, file)
      })

      const response = await fetch('https://api.fabrilab.com.au/contact', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          company: '',
          project: '',
          message: '',
          files: []
        })
        // Reset file input
        const fileInput = document.getElementById('files') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="fl-contact">
      <div className="fl-contact-content">
        <h2>Let's scope your design project.</h2>
        <p>
          Send us your requirements, sketches, or problem statement and
          we'll provide a design consultation and proposal.
        </p>
      </div>

      <div className="fl-contact-form-container">
        <form onSubmit={handleSubmit} className="fl-contact-form">
          <div className="fl-form-row">
            <div className="fl-form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="fl-form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="fl-form-row">
            <div className="fl-form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            <div className="fl-form-group">
              <label htmlFor="project">Project Type</label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
              >
                <option value="">Select project type</option>
                <option value="architectural-metalwork">Architectural Metalwork</option>
                <option value="ceiling-systems">Ceiling & Soffit Systems</option>
                <option value="facade-systems">Facade Systems</option>
                <option value="custom-fabrication">Custom Fabrication</option>
                <option value="cad-detailing">CAD Detailing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="fl-form-group">
            <label htmlFor="message">Project Details *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your project requirements, timeline, or any specific challenges..."
              required
              rows={5}
            />
          </div>

          <div className="fl-form-group">
            <label htmlFor="files">Attach Files (DWG, RVT, STEP, PDF, etc.)</label>
            <input
              type="file"
              id="files"
              name="files"
              onChange={handleFileChange}
              multiple
              accept=".dwg,.rvt,.step,.stp,.pdf,.jpg,.jpeg,.png,.zip,.rar"
            />
            <small style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Accepted formats: DWG, RVT, STEP, PDF, images, archives (max 10MB total)
            </small>
          </div>

          <button
            type="submit"
            className="fl-primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>

          {submitStatus === 'success' && (
            <div className="fl-form-success">
              Thank you! We'll get back to you within 24 hours.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="fl-form-error">
              Sorry, there was an error sending your message. Please try again or email us directly.
            </div>
          )}
        </form>

        <div className="fl-contact-alt">
          <p>Prefer to email directly?</p>
          <a href="mailto:james@fabrilab.com.au">james@fabrilab.com.au</a>
        </div>
      </div>
    </section>
  )
}

export default ContactBar
