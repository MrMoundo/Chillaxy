import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";
import "./bot.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/videos", videoRoutes);
app.use("/auth", authRoutes);

app.listen(process.env.PORT || 3000);
