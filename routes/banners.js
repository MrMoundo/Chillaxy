import express from "express";
import fs from "fs-extra";
import multer from "multer";

const router = express.Router();
const FILE = "./data/banners.json";

const upload = multer({ dest: "public/banners" });

router.get("/", async (_, res) => {
  res.json(await fs.readJson(FILE));
});

router.post("/", upload.single("image"), async (req,res)=>{
  const banners = await fs.readJson(FILE);
  banners.push({
    url:`/banners/${req.file.filename}`,
    time:Date.now()
  });
  if(banners.length>5) banners.shift();
  await fs.writeJson(FILE,banners,{spaces:2});
  res.json({success:true});
});

export default router;
