require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});