import express from "express";
import fs from "fs-extra";

const router = express.Router();
const VIDEOS = "./data/videos.json";
const ADMINS = "./data/admins.json";

const isAdmin = async (req) => {
  const admins = await fs.readJson(ADMINS);
  return admins.includes(req.session.user);
};

router.get("/", async (_, res) => {
  res.json(await fs.readJson(VIDEOS));
});

router.put("/:code", async (req, res) => {
  if (!(await isAdmin(req))) return res.sendStatus(403);

  const videos = await fs.readJson(VIDEOS);
  const i = videos.findIndex(v => v.code === req.params.code);
  if (i === -1) return res.sendStatus(404);

  videos[i] = { ...videos[i], ...req.body };
  await fs.writeJson(VIDEOS, videos, { spaces: 2 });
  res.json({ success: true });
});

router.delete("/:code", async (req, res) => {
  if (!(await isAdmin(req))) return res.sendStatus(403);

  const videos = await fs.readJson(VIDEOS);
  const filtered = videos.filter(v => v.code !== req.params.code);
  await fs.writeJson(VIDEOS, filtered, { spaces: 2 });
  res.json({ success: true });
});

export default router;
