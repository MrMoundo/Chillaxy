import express from "express";
import fs from "fs-extra";

const router = express.Router();

const VIDEOS = "./data/videos.json";
const ADMINS = "./data/admins.json";
const AUDIT = "./data/audit.json";

const log = async (user, action, target = "") => {
  const audit = (await fs.pathExists(AUDIT))
    ? await fs.readJson(AUDIT)
    : [];

  audit.unshift({
    user,
    action,
    target,
    time: new Date().toISOString()
  });

  await fs.writeJson(AUDIT, audit.slice(0, 500), { spaces: 2 });
};

const isAdmin = async (req) => {
  if (!req.session.user) return false;
  const admins = await fs.readJson(ADMINS);
  return admins.includes(req.session.user.id); // ✅ الإصلاح المهم
};

/* GET videos */
router.get("/", async (_, res) => {
  res.json(await fs.readJson(VIDEOS));
});

/* EDIT */
router.put("/:code", async (req, res) => {
  if (!(await isAdmin(req))) return res.sendStatus(403);

  const videos = await fs.readJson(VIDEOS);
  const i = videos.findIndex(v => v.code === req.params.code);
  if (i === -1) return res.sendStatus(404);

  videos[i] = { ...videos[i], ...req.body };
  await fs.writeJson(VIDEOS, videos, { spaces: 2 });

  await log(req.session.user.username, "edit_video", videos[i].name);
  res.json({ success: true });
});

/* DELETE */
router.delete("/:code", async (req, res) => {
  if (!(await isAdmin(req))) return res.sendStatus(403);

  const videos = await fs.readJson(VIDEOS);
  const removed = videos.find(v => v.code === req.params.code);

  await fs.writeJson(
    VIDEOS,
    videos.filter(v => v.code !== req.params.code),
    { spaces: 2 }
  );

  if (removed) {
    await log(req.session.user.username, "delete_video", removed.name);
  }

  res.json({ success: true });
});

export default router;
