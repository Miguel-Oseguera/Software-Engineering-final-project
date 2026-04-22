import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Clear existing seeded products to avoid duplicates
    await db.execute(`DELETE FROM products WHERE seller = 'fakeamazon'`);

    const response = await fetch("https://dummyjson.com/products?limit=194&select=title,price,description,images,stock,category");
    const { products } = await response.json();

    let inserted = 0;
    for (const p of products) {
      const id = Date.now() + inserted;
      await db.execute({
        sql: `INSERT INTO products (id, name, price, description, images, availability, quantity_remaining, seller, category)
              VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        args: [
          id,
          p.title,
          p.price,
          p.description,
          JSON.stringify(p.images),
          p.stock,
          "fakeamazon",
          p.category,
        ],
      });
      inserted++;
    }

    res.json({ success: true, inserted });
  } catch (err) {
    console.error("Seed error:", err.message);
    res.status(500).json({ error: "Seed failed", details: err.message });
  }
});

export default router;