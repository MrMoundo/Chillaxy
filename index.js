import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import adminRoutes from "./routes/admins.js";
import bannerRoutes from "./routes/banners.js";

import "./bot.js";

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
app.use("/api/admins", adminRoutes);
app.use("/api/banners", bannerRoutes);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Chillaxy Backend is running");
});
