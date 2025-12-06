
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const cheerio = require("cheerio");
// const db = require("../db");

// router.post("/", async (req, res) => {
//     const { asin } = req.body;

//     if (!asin) {
//         return res.status(400).json({ error: "ASIN is required" });
//     }

//     try {
//         const url = `https://www.amazon.in/dp/${asin}`;
//         const response = await axios.get(url, {
//             headers: {
//                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0"
//             }
//         });

//         const $ = cheerio.load(response.data);
//         const title = $("#productTitle").text().trim() || "Title not found";
//         const optimized = "Optimized - " + title;

//         const sql = "INSERT INTO optimizations (asin, original_title, optimized_title) VALUES (?, ?, ?)";
//         db.query(sql, [asin, title, optimized], (err, result) => {
//             if (err) return res.status(500).json({ error: err });

//             res.json({
//                 asin,
//                 original_title: title,
//                 optimized_title: optimized
//             });
//         });

//     } catch (error) {
//         res.status(500).json({ error: "Amazon fetch failed", details: error.message });
//     }
// });

// module.exports = router;
// backend/routes/optimize.js

// backend/routes/optimize.js





// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const db = require("../db");
// require("dotenv").config();

// // OpenAI CommonJS setup
// const OpenAI = require("openai");
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// // POST /api/optimize
// router.post("/", async (req, res) => {
//   const { asin } = req.body;

//   if (!asin) return res.status(400).json({ error: "ASIN is required" });

//   try {
//     // 1️⃣ Fetch Amazon product page
//     const url = `https://www.amazon.in/dp/${asin}`;
//     const { data: html } = await axios.get(url, {
//       headers: {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
//         "Accept-Language": "en-IN,en;q=0.9"
//       }
//     });

//     // 2️⃣ Extract original title from HTML
//     const titleMatch = html.match(/<span id="productTitle".*?>(.*?)<\/span>/s);
//     const original_title = titleMatch ? titleMatch[1].trim() : "Title not found";

//     // 3️⃣ Generate optimized title using OpenAI
//     const prompt = `
// Original Amazon product title:
// "${original_title}"

// Rewrite this into a better, keyword-rich, SEO-friendly title
// suitable for Amazon. Keep it under 150 characters.
// `;

//     const aiResponse = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are an expert Amazon product listing optimizer." },
//         { role: "user", content: prompt }
//       ],
//       max_tokens: 60
//     });

//     const optimized_title = aiResponse.choices[0].message.content.trim();

//     // 4️⃣ Save to MySQL
//     const sql = `
//       INSERT INTO optimizations (asin, original_title, optimized_title)
//       VALUES (?, ?, ?)
//     `;
//     db.query(sql, [asin, original_title, optimized_title], (err) => {
//       if (err) {
//         console.error("DB insert error:", err);
//       }
//     });

//     // 5️⃣ Return JSON to frontend
//     res.json({ asin, original_title, optimized_title });

//   } catch (err) {
//     console.error("Optimization error:", err);
//     res.status(500).json({ error: "Optimization failed", details: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { asin } = req.body;
  if (!asin) return res.status(400).json({ error: "ASIN is required" });

  try {
    // 1️⃣ Fetch Amazon product page
    const url = `https://www.amazon.in/dp/${asin}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9"
      }
    });

    // 2️⃣ Extract product title
    const titleMatch = data.match(/<span id="productTitle".*?>([\s\S]*?)<\/span>/s);
    const original_title = titleMatch ? titleMatch[1].trim() : "Title not found";

    // 3️⃣ Extract bullet points (up to 5)
    let original_bullets = [];
    const bulletListMatch = data.match(/<div id="feature-bullets"[\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/);
    if (bulletListMatch) {
      original_bullets = [...bulletListMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
        .map(b => b[1].replace(/<[^>]*>/g, "").trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    // 4️⃣ Extract product description
    const descMatch = data.match(/<div id="productDescription"[\s\S]*?>([\s\S]*?)<\/div>/);
    let original_description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";
    if (!original_description) original_description = "No description available";

    // 5️⃣ Prepare Gemini prompt
    const prompt = `
Original Amazon product title: "${original_title}"
Original bullets: ${JSON.stringify(original_bullets)}
Original description: "${original_description}"

Rewrite for Amazon listing:
- Optimized, keyword-rich title
- 3–5 concise bullet points
- Persuasive product description
- Suggest 3–5 keywords

Return strictly as JSON:
{
  "optimized_title": "...",
  "bullets": ["...", "...", "..."],
  "description": "...",
  "keywords": ["...", "...", "..."]
}
Do not include extra text outside JSON.
`;

    // 6️⃣ Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const aiResponse = await model.generateContent(prompt);

    // 7️⃣ Extract AI text properly
    let rawOutput = "";
    if (
      aiResponse.response.candidates &&
      aiResponse.response.candidates[0] &&
      aiResponse.response.candidates[0].content &&
      aiResponse.response.candidates[0].content.parts &&
      aiResponse.response.candidates[0].content.parts[0] &&
      aiResponse.response.candidates[0].content.parts[0].text
    ) {
      console.log("Found AI response parts"); // Debugging
      rawOutput = aiResponse.response.candidates[0].content.parts[0].text;
    } else {
      console.log("Not "); // Debugging
      rawOutput = JSON.stringify(aiResponse);
    }

    // 7.1️⃣ Remove ```json and ``` if present
    rawOutput = rawOutput.replace(/```json|```/g, "").trim();

    console.log("Raw AI Response:", rawOutput); // Debugging

    // 8️⃣ Parse JSON safely
    let aiOutput;
    try {
      aiOutput = JSON.parse(rawOutput);
      console.log("Parsed AI Output :"); // Debugging
    } catch (err) {
      console.error("AI output is not valid JSON:", err.message);
      aiOutput = {
        optimized_title: "Failed to get optimized title",
        bullets: ["Failed to get optimized bullets"],
        description: "Failed to get optimized description",
        keywords: []
      };
    }

    // 9️⃣ Save to MySQL
    const sql =
      `INSERT INTO optimizations 
      (asin, original_title, optimized_title, original_bullets, optimized_bullets, original_description, optimized_description, keywords) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        asin,
        original_title,
        aiOutput.optimized_title,
        JSON.stringify(original_bullets),
        JSON.stringify(aiOutput.bullets),
        original_description,
        aiOutput.description,
        JSON.stringify(aiOutput.keywords)
      ],
      (err, result) => {
        if (err) console.error("DB insert error:", err.message);
      }
    );

    // 10️⃣ Send response
    res.json({
      asin,
      original_title,
      optimized_title: aiOutput.optimized_title,
      original_bullets,
      optimized_bullets: aiOutput.bullets,
      original_description,
      optimized_description: aiOutput.description.slice(0,600),
      keywords: aiOutput.keywords
    });

  } catch (err) {
    console.error("Optimization failed:", err.message);
    res.status(500).json({ error: "Optimization failed", details: err.message });
  }
});

module.exports = router;

