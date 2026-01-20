import express from "express";
import fs from "fs-extra";

const router = express.Router();
const ADMINS = "./data/admins.json";
const AUDIT = "./data/audit.json";

const log = async (user, action, target = "") => {
  const audit = await fs.readJson(AUDIT);
  audit.unshift({
    user,
    action,
    target,
    time: new Date().toISOString()
  });
  await fs.writeJson(AUDIT, audit.slice(0, 500), { spaces: 2 });
};

router.post("/", async (req, res) => {
  const admins = await fs.readJson(ADMINS);

  if (!admins.includes(req.body.id)) {
    admins.push(req.body.id);
    await fs.writeJson(ADMINS, admins, { spaces: 2 });

    await log(req.session.user, "add_admin", req.body.id);
  }

  res.json({ success: true });
});

export default router;
