import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./bot.js";
import videoRoutes from "./routes/videos.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/videos", videoRoutes);

app.get("/", (req, res) => {
  res.send("Chillaxy Backend is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
