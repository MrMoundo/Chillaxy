import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/videos.json";

router.get("/", async (req, res) => {
  const data = await fs.readJson(FILE);
  res.json(data);
});

export default router;
