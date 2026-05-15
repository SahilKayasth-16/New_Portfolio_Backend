const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Resend } = require('resend');
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
