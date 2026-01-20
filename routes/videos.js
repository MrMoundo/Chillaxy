import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/videos.json";

router.get("/", async (req, res) => {
  const data = await fs.readJson(FILE);
  res.json(data);
});

router.post("/", async (req, res) => {
  const data = await fs.readJson(FILE);
  data.push(req.body);
  await fs.writeJson(FILE, data, { spaces: 2 });
  res.json({ success: true });
});

export default router;
