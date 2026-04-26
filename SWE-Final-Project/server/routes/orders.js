import express from "express";
import db from "../db/index.js";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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

    // Look up buyer's email
    const userResult = await db.execute({
      sql: "SELECT email FROM auth_users WHERE username = ?",
      args: [buyer],
    });
    const buyerEmail = userResult.rows[0]?.email;

    if (buyerEmail && process.env.RESEND_API_KEY) {
      const TAX_RATE = 0.0825;
      const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0), 0);
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;

      const itemRows = items.map(i =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${Number(i.price).toFixed(2)}</td>
        </tr>`
      ).join("");

      await resend.emails.send({
        from: "FakeAmazon <onboarding@resend.dev>",
        to: buyerEmail,
        subject: "Your FakeAmazon Order Receipt",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto">
            <h2 style="color:#000">Order Confirmed!</h2>
            <p>Thanks for your purchase, <strong>${buyer}</strong>. Here's your receipt:</p>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f5f5f5">
                  <th style="padding:8px;text-align:left">Item</th>
                  <th style="padding:8px;text-align:right">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <div style="margin-top:16px;text-align:right">
              <p>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
              <p>Tax (8.25%): <strong>$${tax.toFixed(2)}</strong></p>
              <p>Shipping: <strong>FREE</strong></p>
              <p style="font-size:18px">Total: <strong>$${total.toFixed(2)}</strong></p>
            </div>
            <p style="color:#777;font-size:12px;margin-top:24px">This is not a real store. No actual purchase was made.</p>
          </div>
        `,
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
