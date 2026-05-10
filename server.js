const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sahilkportfolio.vercel.app"
    ]
  }));
app.use(express.json());

// MongoDB Connection
const baseUri = process.env.MONGODB_URI.endsWith('/') ? process.env.MONGODB_URI : `${process.env.MONGODB_URI}/`;
mongoose.connect(`${baseUri}SahilKayasth'sPortfolio?retryWrites=true&w=majority`)
  .then(() => console.log('✅ MongoDB Connected to SahilKayasth\'sPortfolio'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schema Definitions
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now }
}, { collection: 'contacts' });

const Contact = mongoose.model('Contact', ContactSchema);

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  techStack: [String],
  githubUrl: String,
  liveUrl: String,
  image: String,
  category: String
});

const SkillSchema = new mongoose.Schema({
  name: String,
  category: String,
  icon: String,
  level: Number
});

const Project = mongoose.model('Project', ProjectSchema);
const Skill = mongoose.model('Skill', SkillSchema);

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log environment variables (safe check)
console.log('--- Environment Check ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `Set (${process.env.EMAIL_USER})` : 'Missing ❌');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✅' : 'Missing ❌');
console.log('-------------------------');

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer Verification Error:', error);
  } else {
    console.log('✅ Nodemailer is ready to send emails');
  }
});

// Contact Form Route
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // 1. Save to Database
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    console.log(`✅ Contact saved to DB for ${name}`);

    // 2. Prepare Email Notification
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      text: `You have a new message from your portfolio:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      html: `
        <h3>New Portfolio Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // 3. Send Email Notification (Awaited)
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully for ${name}`);
      res.status(200).json({ message: 'Message saved and email sent successfully!' });
    } catch (mailErr) {
      console.error(`❌ Email sending failed for ${name}:`, mailErr);
      res.status(500).json({ 
        error: 'Message saved to database, but email notification failed.', 
        details: mailErr.message 
      });
    }
  } catch (err) {
    console.error('❌ Database/Contact Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
