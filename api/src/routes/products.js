const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, name, description, price_cents, price_discounted FROM products ORDER BY id"
    );

    res.json({
      source: "database",
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    const result = await db.query(
      "SELECT id, name, description, price_cents FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      source: "database",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
