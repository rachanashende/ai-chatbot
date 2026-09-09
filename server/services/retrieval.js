const fs = require("fs");
const path = require("path");
const { embedText } = require("./embeddings");

const FAQS_PATH = path.join(__dirname, "../data/faqs-embedded.json");

let faqsCache = null;

function loadFaqs() {
  if (!faqsCache) {
    if (!fs.existsSync(FAQS_PATH)) {
      throw new Error(
        "faqs-embedded.json not found. Run `node scripts/embedFaqs.js` first."
      );
    }
    faqsCache = JSON.parse(fs.readFileSync(FAQS_PATH, "utf-8"));
  }
  return faqsCache;
}

function cosineSim(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}

/**
 * Embeds the user's question, scores it against every FAQ's stored
 * embedding, and returns the top matches above the similarity threshold.
 * An empty result means "no confident FAQ match" — the caller should
 * fall back to campus-profile-only reasoning (see buildPrompt.js).
 */
async function retrieveTopMatches(userQuestion, topK = 3, threshold = 0.75) {
  const faqs = loadFaqs();
  const queryVector = await embedText(userQuestion);

  return faqs
    .map((f) => ({ ...f, score: cosineSim(queryVector, f.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((f) => f.score >= threshold);
}

module.exports = { retrieveTopMatches, cosineSim };
