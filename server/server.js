require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const db = require('./db');
const { sendInquiryAlert } = require('./email');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'badtameez_super_secret_key_2026';

// 1. Performance Compression Middleware
app.use(compression());

// 2. Helmet HTTP Security Headers (Fine-tuned for media embeds)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://s.ytimg.com", "https://*.youtube.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:", "https://i.ytimg.com", "https://*.ytimg.com", "https://*.googleusercontent.com"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://*.youtube.com", "https://open.spotify.com"],
        mediaSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "https://*.googlevideo.com", "https://*.youtube.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// 2. Rate Limiters
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per IP
  message: { error: 'Too many messages sent from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file directories
const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');
const AUDIO_DIR = path.join(ASSETS_DIR, 'audio');

// Ensure upload folders exist
[IMAGES_DIR, AUDIO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer for asset uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, AUDIO_DIR);
    } else {
      cb(null, IMAGES_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uniqueSuffix = Date.now();
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Serve frontend static files
app.use(express.static(ROOT_DIR));

// JWT Authentication Middleware for Admin Routes
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired authentication token' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing' });
  }
};

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// 1. Get all public website content
app.get('/api/content', (req, res) => {
  try {
    const content = db.getPublicContent();
    res.json(content);
  } catch (e) {
    res.status(500).json({ error: 'Failed to retrieve website content' });
  }
});

// 2. Submit Contact Inquiry (With Rate Limiter & Honeypot Protection)
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, service, message, _gotcha } = req.body;

    // Honeypot anti-spam check: if bot fills hidden field, silently exit
    if (_gotcha && _gotcha.trim() !== '') {
      return res.status(201).json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    const data = db.read();
    if (!data.messages) data.messages = [];

    const newInquiry = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      service: service || 'general',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    data.messages.unshift(newInquiry);
    db.write(data);

    // Asynchronously dispatch email notification
    sendInquiryAlert(newInquiry).catch(err => console.error('Inquiry alert dispatch error:', err));

    res.status(201).json({ success: true, message: 'Your message has been sent with soul!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

/* ==========================================================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Admin Login (With Brute Force Rate Limiter)
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  const data = db.read();

  if (!data.admin || username !== data.admin.username) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const isValidPassword = bcrypt.compareSync(password, data.admin.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  data.admin.lastLogin = new Date().toISOString();
  db.write(data);

  const token = jwt.sign({ username: data.admin.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, username: data.admin.username });
});

// Verify Token
app.get('/api/admin/check-auth', authenticateJWT, (req, res) => {
  res.json({ authenticated: true, username: req.user.username });
});

// Change Password
app.post('/api/admin/change-password', authenticateJWT, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const data = db.read();
  const isValid = bcrypt.compareSync(currentPassword, data.admin.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  data.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  db.write(data);
  res.json({ success: true, message: 'Password updated successfully!' });
});

/* ==========================================================================
   ADMIN CONTENT MANAGEMENT ENDPOINTS
   ========================================================================== */

// 1. Update Hero Section
app.put('/api/admin/hero', authenticateJWT, (req, res) => {
  const data = db.read();
  data.hero = { ...data.hero, ...req.body };
  db.write(data);
  res.json({ success: true, data: data.hero });
});

// 2. Update Tech & Code Profile
app.put('/api/admin/tech', authenticateJWT, (req, res) => {
  const data = db.read();
  data.tech = { ...data.tech, ...req.body };
  db.write(data);
  res.json({ success: true, data: data.tech });
});

/* --- ENTERPRISE PROJECTS CRUD --- */

// Add project
app.post('/api/admin/projects', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.tech) data.tech = {};
  if (!data.tech.enterpriseProjects) data.tech.enterpriseProjects = [];

  const newProject = {
    id: Date.now(),
    name: req.body.name || 'Project',
    fullName: req.body.fullName || '',
    category: req.body.category || 'Enterprise Architecture',
    description: req.body.description || '',
    techStack: Array.isArray(req.body.techStack) ? req.body.techStack : []
  };

  data.tech.enterpriseProjects.push(newProject);
  db.write(data);
  res.status(201).json({ success: true, data: newProject });
});

// Update project
app.put('/api/admin/projects/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  if (!data.tech || !data.tech.enterpriseProjects) {
    return res.status(404).json({ error: 'Projects not found' });
  }

  const index = data.tech.enterpriseProjects.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  data.tech.enterpriseProjects[index] = {
    ...data.tech.enterpriseProjects[index],
    ...req.body,
    id
  };
  db.write(data);
  res.json({ success: true, data: data.tech.enterpriseProjects[index] });
});

// Delete project
app.delete('/api/admin/projects/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  if (!data.tech || !data.tech.enterpriseProjects) {
    return res.status(404).json({ error: 'Projects not found' });
  }

  data.tech.enterpriseProjects = data.tech.enterpriseProjects.filter(p => p.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Project deleted successfully' });
});

// 3. Update About Section
app.put('/api/admin/about', authenticateJWT, (req, res) => {
  const data = db.read();
  data.about = { ...data.about, ...req.body };
  db.write(data);
  res.json({ success: true, data: data.about });
});

// 4. Update Social Media Links
app.put('/api/admin/socials', authenticateJWT, (req, res) => {
  const data = db.read();
  data.socials = { ...data.socials, ...req.body };
  db.write(data);
  res.json({ success: true, data: data.socials });
});

// 5. Update Global Site Settings
app.put('/api/admin/settings', authenticateJWT, (req, res) => {
  const data = db.read();
  data.settings = { ...data.settings, ...req.body };
  db.write(data);
  res.json({ success: true, data: data.settings });
});

/* --- SONGS CRUD --- */

// Get all songs (admin)
app.get('/api/admin/songs', authenticateJWT, (req, res) => {
  const data = db.read();
  res.json(data.songs || []);
});

// Add new song
app.post('/api/admin/songs', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.songs) data.songs = [];

  const newSong = {
    id: Date.now(),
    title: req.body.title || 'Untitled Song',
    subtitle: req.body.subtitle || '',
    genre: req.body.genre || 'Single',
    duration: req.body.duration || '03:00',
    durationSec: parseInt(req.body.durationSec, 10) || 180,
    artwork: req.body.artwork || 'assets/images/song-shodh.jpg',
    availability: req.body.availability || 'youtube',
    youtubeId: req.body.youtubeId || '',
    youtubeUrl: req.body.youtubeUrl || '',
    spotifyId: req.body.spotifyId || '',
    spotifyUrl: req.body.spotifyUrl || '',
    isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
    description: req.body.description || '',
    lyrics: req.body.lyrics || ''
  };

  data.songs.push(newSong);
  db.write(data);
  res.status(201).json({ success: true, data: newSong });
});

// Update song
app.put('/api/admin/songs/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  const index = data.songs.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Song not found' });
  }

  data.songs[index] = { ...data.songs[index], ...req.body, id };
  db.write(data);
  res.json({ success: true, data: data.songs[index] });
});

// Delete song
app.delete('/api/admin/songs/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  data.songs = data.songs.filter(s => s.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Song deleted successfully' });
});

// Reorder songs
app.post('/api/admin/songs/reorder', authenticateJWT, (req, res) => {
  const { songIds } = req.body;
  if (!Array.isArray(songIds)) {
    return res.status(400).json({ error: 'Expected songIds array' });
  }

  const data = db.read();
  const reordered = [];
  songIds.forEach(id => {
    const song = data.songs.find(s => s.id === parseInt(id, 10));
    if (song) reordered.push(song);
  });

  // Append any unmentioned songs
  data.songs.forEach(s => {
    if (!reordered.some(item => item.id === s.id)) reordered.push(s);
  });

  data.songs = reordered;
  db.write(data);
  res.json({ success: true, data: data.songs });
});

/* --- POETRY CATEGORIES CRUD --- */

// Add new poetry category
app.post('/api/admin/poetry/categories', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.poetry) data.poetry = { categories: [], written: [], recitedVideos: [] };
  if (!data.poetry.categories) data.poetry.categories = [];

  const label = (req.body.label || '').trim();
  if (!label) {
    return res.status(400).json({ error: 'Category label is required' });
  }

  const id = (req.body.id || label.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
  const exists = data.poetry.categories.some(c => c.id === id);
  if (exists) {
    return res.status(400).json({ error: 'Category ID already exists' });
  }

  const newCat = { id, label };
  data.poetry.categories.push(newCat);
  db.write(data);
  res.status(201).json({ success: true, data: newCat });
});

// Update poetry category
app.put('/api/admin/poetry/categories/:id', authenticateJWT, (req, res) => {
  const catId = req.params.id;
  const data = db.read();
  if (!data.poetry || !data.poetry.categories) {
    return res.status(404).json({ error: 'Categories not found' });
  }

  const index = data.poetry.categories.findIndex(c => c.id === catId);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const label = (req.body.label || '').trim();
  if (!label) {
    return res.status(400).json({ error: 'Category label is required' });
  }

  data.poetry.categories[index].label = label;
  db.write(data);
  res.json({ success: true, data: data.poetry.categories[index] });
});

// Delete poetry category
app.delete('/api/admin/poetry/categories/:id', authenticateJWT, (req, res) => {
  const catId = req.params.id;
  const data = db.read();
  if (!data.poetry || !data.poetry.categories) {
    return res.status(404).json({ error: 'Categories not found' });
  }

  data.poetry.categories = data.poetry.categories.filter(c => c.id !== catId);
  db.write(data);
  res.json({ success: true, message: 'Category deleted successfully' });
});

/* --- POETRY CRUD --- */

// Add written poetry
app.post('/api/admin/poetry', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.poetry) data.poetry = { categories: [], written: [], recitedVideos: [] };

  const newVerse = {
    id: Date.now(),
    category: req.body.category || 'ishq',
    theme: req.body.theme || 'Ishq & Jazbaat',
    titleHindi: req.body.titleHindi || '',
    titleRoman: req.body.titleRoman || '',
    linesHindi: req.body.linesHindi || '',
    linesRoman: req.body.linesRoman || '',
    englishMeaning: req.body.englishMeaning || '',
    notes: req.body.notes || ''
  };

  data.poetry.written.push(newVerse);
  db.write(data);
  res.status(201).json({ success: true, data: newVerse });
});

// Update written poetry
app.put('/api/admin/poetry/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  const index = data.poetry.written.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Poem not found' });
  }

  data.poetry.written[index] = { ...data.poetry.written[index], ...req.body, id };
  db.write(data);
  res.json({ success: true, data: data.poetry.written[index] });
});

// Delete written poetry
app.delete('/api/admin/poetry/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  data.poetry.written = data.poetry.written.filter(p => p.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Poem deleted successfully' });
});

/* --- RECITED POETRY VIDEOS CRUD --- */

// Add video recital
app.post('/api/admin/poetry-videos', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.poetry) data.poetry = { written: [], recitedVideos: [] };

  const newVideo = {
    id: Date.now(),
    title: req.body.title || 'Untitled Recital',
    category: req.body.category || 'Recited Poetry',
    tag: req.body.tag || 'Recited Video',
    youtubeId: req.body.youtubeId || '',
    youtubeUrl: req.body.youtubeUrl || '',
    thumbnail: req.body.thumbnail || 'assets/images/poetry-fir-tum-aazaad-ho.jpg'
  };

  data.poetry.recitedVideos.push(newVideo);
  db.write(data);
  res.status(201).json({ success: true, data: newVideo });
});

// Update video recital
app.put('/api/admin/poetry-videos/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  const index = data.poetry.recitedVideos.findIndex(v => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Video recital not found' });
  }

  data.poetry.recitedVideos[index] = { ...data.poetry.recitedVideos[index], ...req.body, id };
  db.write(data);
  res.json({ success: true, data: data.poetry.recitedVideos[index] });
});

// Delete video recital
app.delete('/api/admin/poetry-videos/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  data.poetry.recitedVideos = data.poetry.recitedVideos.filter(v => v.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Video recital deleted successfully' });
});

/* --- ART GALLERY CRUD --- */

// Add artwork
app.post('/api/admin/gallery', authenticateJWT, (req, res) => {
  const data = db.read();
  if (!data.gallery) data.gallery = [];

  const newArt = {
    id: Date.now(),
    title: req.body.title || 'Artwork',
    category: req.body.category || 'album-art',
    categoryLabel: req.body.categoryLabel || 'Visual Creation',
    note: req.body.note || '',
    image: req.body.image || 'assets/images/song-shodh.jpg'
  };

  data.gallery.push(newArt);
  db.write(data);
  res.status(201).json({ success: true, data: newArt });
});

// Update artwork
app.put('/api/admin/gallery/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  const index = data.gallery.findIndex(g => g.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Artwork not found' });
  }

  data.gallery[index] = { ...data.gallery[index], ...req.body, id };
  db.write(data);
  res.json({ success: true, data: data.gallery[index] });
});

// Delete artwork
app.delete('/api/admin/gallery/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  data.gallery = data.gallery.filter(g => g.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Artwork deleted successfully' });
});

/* --- MESSAGES INBOX --- */

// Get all messages
app.get('/api/admin/messages', authenticateJWT, (req, res) => {
  const data = db.read();
  res.json(data.messages || []);
});

// Mark message as read
app.put('/api/admin/messages/:id/read', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  const msg = (data.messages || []).find(m => m.id === id);
  if (msg) {
    msg.isRead = true;
    db.write(data);
  }
  res.json({ success: true });
});

// Delete message
app.delete('/api/admin/messages/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = db.read();
  data.messages = (data.messages || []).filter(m => m.id !== id);
  db.write(data);
  res.json({ success: true, message: 'Message deleted' });
});

/* --- FILE UPLOAD API --- */
app.post('/api/admin/upload', authenticateJWT, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const isAudio = req.file.mimetype.startsWith('audio/');
  const relativePath = isAudio 
    ? `assets/audio/${req.file.filename}` 
    : `assets/images/${req.file.filename}`;

  res.json({
    success: true,
    filename: req.file.filename,
    filePath: relativePath,
    url: `/${relativePath}`
  });
});

// Health Check Endpoint (For Cloud Monitors & Load Balancers)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: db.isCloud ? 'MongoDB Atlas (Connected)' : 'Local File Store',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve admin dashboard at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin.html'));
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Global 404 Handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎵 BADTAMEEZ MUSIC FULL-STACK SERVER RUNNING`);
  console.log(`🌐 Public Website:   http://localhost:${PORT}`);
  console.log(`🛡️  Admin Dashboard:  http://localhost:${PORT}/admin`);
  console.log(`🩺 Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Closing HTTP server and database connections...`);
  server.close(() => {
    console.log('HTTP server closed.');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
