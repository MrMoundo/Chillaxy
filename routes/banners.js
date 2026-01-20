import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/banners.json";

router.get("/", async (_, res) => {
  res.json(await fs.readJson(FILE));
});

export default router;
