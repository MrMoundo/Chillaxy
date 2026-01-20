import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/admins.json";

router.get("/", async (_, res) => {
  res.json(await fs.readJson(FILE));
});

router.post("/", async (req, res) => {
  const admins = await fs.readJson(FILE);
  if (!admins.includes(req.body.id)) {
    admins.push(req.body.id);
    await fs.writeJson(FILE, admins, { spaces: 2 });
  }
  res.json({ success: true });
});

export default router;
