import express from "express";
import fs from "fs-extra";

const router = express.Router();
const FILE = "./data/banners.json";

router.get("/", async (_,res)=>{
  res.json(await fs.readJson(FILE));
});

router.post("/", async (req,res)=>{
  if(!req.session.user) return res.sendStatus(401);

  const banners = await fs.readJson(FILE);
  banners.push(req.body.link);

  if (banners.length > 5) banners.shift();

  await fs.writeJson(FILE,banners,{spaces:2});
  res.json({success:true});
});

export default router;
