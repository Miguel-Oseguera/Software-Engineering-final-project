import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { items, buyer } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: "No items" });

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const productResult = await db.execute({
        sql: "SELECT * FROM products WHERE id = ?",
        args: [item.id],
      });

      if (productResult.rows.length === 0) continue;
      const product = productResult.rows[0];

      const newQty = Math.max(0, (product.quantity_remaining || 0) - 1);
      const newAvail = newQty > 0 ? 1 : 0;

      await db.execute({
        sql: "UPDATE products SET quantity_remaining = ?, availability = ? WHERE id = ?",
        args: [newQty, newAvail, item.id],
      });

      await db.execute({
        sql: `INSERT INTO sales (id, product_id, product_name, seller, buyer, price)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          Date.now() + i,
          item.id,
          item.name,
          product.seller || null,
          buyer || null,
          item.price,
        ],
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/orders error:", err.message);
    res.status(500).json({ error: "Failed to process order" });
  }
});

router.get("/sold/:username", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT product_name, price, buyer, sold_at, COUNT(*) as quantity
            FROM sales
            WHERE seller = ?
            GROUP BY product_id, product_name, buyer, sold_at
            ORDER BY sold_at DESC`,
      args: [req.params.username],
    });
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/orders/sold error:", err.message);
    res.status(500).json({ error: "Failed to load sales" });
  }
});

export default router;
