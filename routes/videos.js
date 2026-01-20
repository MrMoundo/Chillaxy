import express from "express";
import fs from "fs";

const router = express.Router();
const DATA_PATH = "./data/videos.json";

router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  res.json(data);
});

export default router;
