/**
 * Run this whenever faqs.json changes:
 *   node scripts/embedFaqs.js
 *
 * Reads data/faqs.json, generates an embedding for each entry, and writes
 * the result (FAQ fields + embedding vector) to data/faqs-embedded.json.
 * The server reads from faqs-embedded.json at runtime — it never embeds
 * on the fly, so startup stays fast and you're not re-spending API calls
 * on every restart.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { embedText } = require("../services/embeddings");

const INPUT_PATH = path.join(__dirname, "../data/faqs.json");
const OUTPUT_PATH = path.join(__dirname, "../data/faqs-embedded.json");

async function run() {
  const faqs = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  const embedded = [];

  for (const faq of faqs) {
    console.log(`Embedding: ${faq.id} — ${faq.question}`);
    // Embed question + answer together so retrieval matches on meaning,
    // not just phrasing of the question alone.
    const embedding = await embedText(`${faq.question}\n${faq.answer}`);
    embedded.push({ ...faq, embedding });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embedded, null, 2));
  console.log(`\nDone. Wrote ${embedded.length} embedded FAQs to ${OUTPUT_PATH}`);
}

run().catch((err) => {
  console.error("Embedding script failed:", err);
  process.exit(1);
});
