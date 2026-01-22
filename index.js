import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import fs from "fs-extra";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import bannerRoutes from "./routes/banners.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use("/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/banners", bannerRoutes);

app.use(express.static("public"));

/* ===== CURRENT USER ===== */
app.get("/api/me", async (req, res) => {
  if (!req.session.user) return res.status(401).end();

  const admins = await fs.readJson("./data/admins.json");
  res.json({
    id: req.session.user,
    isAdmin: admins.includes(req.session.user)
  });
});

app.get("/", (_, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Chillaxy running")
);
