// ⭐ Print working directory
console.log("WORKING DIR:", process.cwd());

// ⭐ Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// ⭐ Print env vars to confirm they loaded
console.log("DB URL from server.js:", process.env.TURSO_DATABASE_URL);
console.log("AUTH from server.js:", process.env.TURSO_AUTH_TOKEN);

import express from "express";
import cors from "cors";

import productsRouter from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import { initDB } from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/products", productsRouter);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});