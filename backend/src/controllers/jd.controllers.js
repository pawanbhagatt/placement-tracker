const { z } = require("zod");
const JobDescription = require("../models/JobDescription");

const createSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(30, "JD text should be at least 30 characters"),
});

async function createJD(req, res) {
  const data = createSchema.parse(req.body);
  const jd = await JobDescription.create({ ...data, userId: req.user.id });
  res.status(201).json({ jd });
}

async function listJDs(req, res) {
  const items = await JobDescription.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ items });
}

module.exports = { createJD, listJDs };