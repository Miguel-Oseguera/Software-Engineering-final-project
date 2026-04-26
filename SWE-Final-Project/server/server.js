console.log("WORKING DIR:", process.cwd());

import dotenv from "dotenv";
dotenv.config();

console.log("DB URL from server.js:", process.env.TURSO_DATABASE_URL);
console.log("AUTH from server.js:", process.env.TURSO_AUTH_TOKEN);

import express from "express";
import cors from "cors";

import productsRouter from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";
import seedRouter from "./routes/seed.js";
import { initDB } from "./db/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/seed", seedRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });