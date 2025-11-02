const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB total
    files: 10 // max 10 files
  }
});

// Simple middleware
app.use(cors({
  origin: ['http://fabrilab.com.au', 'https://fabrilab.com.au', 'https://api.fabrilab.com.au', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Contact endpoint with email functionality
app.post(['/contact', '/api/contact'], upload.array('files', 10), async (req, res) => {
  console.log('Contact endpoint called with:', req.body);
  console.log('Files received:', req.files?.length || 0);

  try {
    const { name, email, message, company, project } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Build email content
    let emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>`;

    if (company) {
      emailContent += `<p><strong>Company:</strong> ${company}</p>`;
    }

    if (project) {
      emailContent += `<p><strong>Project Type:</strong> ${project}</p>`;
    }

    emailContent += `
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>`;

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      emailContent += `<p><strong>Attachments:</strong> ${req.files.length} file(s)</p>`;
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        });
      }
    }

    emailContent += `
      <hr>
      <p><small>Sent from FabriLab contact form</small></p>`;

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `Contact Form Submission from ${name}`,
      html: emailContent,
      replyTo: email,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully to:', process.env.CONTACT_EMAIL, 'with', attachments.length, 'attachments');
    res.json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.post('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test endpoint working', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'FabriLab Contact API', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`FabriLab Contact API running on port ${PORT}`);
});
