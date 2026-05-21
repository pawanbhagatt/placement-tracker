const multer = require("multer");
const path = require("path");

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const maxSize = Number(process.env.MAX_FILE_SIZE || 5_000_000);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

function fileFilter(req, file, cb) {
  // allow PDFs only
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { upload };