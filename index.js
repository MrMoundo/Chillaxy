import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admins.js";

import "./bot.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false
  }
}));

app.use("/auth", authRoutes);

app.use("/api/admins", adminRoutes);
app.use("/api/videos", videoRoutes);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Chillaxy Backend is running");
});

app.listen(process.env.PORT || 3000);
