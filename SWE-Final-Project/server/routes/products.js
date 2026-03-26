import express from "express";
import { db } from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;