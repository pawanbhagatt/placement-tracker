const Resume = require("../models/Resume");

async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: "PDF file is required" });

  const doc = await Resume.create({
    userId: req.user.id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    filePath: req.file.path,
  });

  res.status(201).json({ resume: doc });
}

async function listResumes(req, res) {
  const items = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ items });
}

module.exports = { uploadResume, listResumes };