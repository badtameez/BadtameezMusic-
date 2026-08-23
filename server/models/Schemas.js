const mongoose = require('mongoose');

// Unified Schema for Site Settings & Content Documents
const ContentDocSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Admin Account Schema
const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String, default: 'contact@badtameezmusic.com' },
  lastLogin: { type: Date }
});

// Contact Inquiries Schema
const MessageSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: String, default: 'general' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const ContentDoc = mongoose.models.ContentDoc || mongoose.model('ContentDoc', ContentDocSchema);
const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

module.exports = {
  ContentDoc,
  AdminUser,
  Message
};
