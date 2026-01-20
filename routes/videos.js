import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/videos.json";

router.get("/", async (_, res) => {
  res.json(await fs.readJson(FILE));
});

router.delete("/:code", async (req, res) => {
  if (req.session.user !== process.env.ADMIN_ID) {
    return res.sendStatus(403);
  }

  const data = await fs.readJson(FILE);
  const filtered = data.filter(v => v.code !== req.params.code);
  await fs.writeJson(FILE, filtered, { spaces: 2 });
  res.json({ success: true });
});

export default router;
