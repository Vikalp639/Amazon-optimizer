// backend/routes/saveResult.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// request body expected:
// {
//   "user_id": "user123",      // optional
//   "asin": "B08XYZ",
//   "topic": "Electronics",    // optional
//   "score": 8,
//   "total_questions": 10,
//   "details": { ... }         // optional object with per-question answers
// }

router.post("/", (req, res) => {
  const { user_id, asin, topic, score, total_questions, details } = req.body;

  const sql = `
    INSERT INTO quiz_results
      (user_id, asin, topic, score, total_questions, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const detailsValue = details ? JSON.stringify(details) : null;

  db.query(
    sql,
    [user_id || null, asin || null, topic || null, score || null, total_questions || null, detailsValue],
    (err, result) => {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "DB insert failed", details: err.message });
      }
      // return the inserted id and row data
      res.json({ message: "Saved", id: result.insertId });
    }
  );
});

module.exports = router;
