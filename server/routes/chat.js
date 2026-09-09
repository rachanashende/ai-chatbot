const express = require("express");
const router = express.Router();
const { buildPrompt } = require("../services/buildPrompt");
const { generateAnswer } = require("../services/gemini");

/**
 * POST /api/chat
 * body: { question: string }
 * returns: { answer: string, tier: "FAQ" | "CampusInfo", matchedFaqs: string[] }
 */
router.post("/", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "A non-empty 'question' string is required." });
  }

  try {
    const { tier, prompt, matchedFaqs } = await buildPrompt(question);
    const answer = await generateAnswer(prompt);
    res.json({ answer, tier, matchedFaqs });
  } catch (err) {
    console.error("Chat route error:", err.message);
    res.status(500).json({ error: "Something went wrong generating a response." });
  }
});

module.exports = router;
