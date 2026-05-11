const { z } = require("zod");
const Application = require("../models/Application");

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  status: z.enum(["APPLIED", "INTERVIEW", "OFFER", "REJECTED"]).optional(),
  appliedDate: z.coerce.date().optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function createApplication(req, res) {
  const data = createSchema.parse(req.body);
  const doc = await Application.create({ ...data, userId: req.user.id });
  res.status(201).json({ application: doc });
}

async function listApplications(req, res) {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { userId: req.user.id };
  if (status) query.status = status;

  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Application.find(query).sort({ updatedAt: -1 }).skip((p - 1) * l).limit(l),
    Application.countDocuments(query),
  ]);

  res.json({ items, page: p, limit: l, total });
}

async function getApplication(req, res) {
  const doc = await Application.findOne({ _id: req.params.id, userId: req.user.id });
  if (!doc) return res.status(404).json({ message: "Application not found" });
  res.json({ application: doc });
}

async function updateApplication(req, res) {
  const data = updateSchema.parse(req.body);
  const doc = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: data },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Application not found" });
  res.json({ application: doc });
}

async function deleteApplication(req, res) {
  const doc = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!doc) return res.status(404).json({ message: "Application not found" });
  res.json({ ok: true });
}

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
};