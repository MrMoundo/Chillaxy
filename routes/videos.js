import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/videos.json";

router.get("/", async (_, res) => {
  res.json(await fs.readJson(FILE));
});

router.put("/:code", async (req, res) => {
  const data = await fs.readJson(FILE);
  const index = data.findIndex(v => v.code === req.params.code);
  if (index === -1) return res.sendStatus(404);

  data[index] = { ...data[index], ...req.body };
  await fs.writeJson(FILE, data, { spaces: 2 });
  res.json({ success: true });
});

router.delete("/:code", async (req, res) => {
  const data = await fs.readJson(FILE);
  const filtered = data.filter(v => v.code !== req.params.code);
  await fs.writeJson(FILE, filtered, { spaces: 2 });
  res.json({ success: true });
});

export default router;
