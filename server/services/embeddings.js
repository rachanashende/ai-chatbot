const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Converts a piece of text into an embedding vector using Gemini's
 * embedding model. Used both when pre-embedding FAQs (scripts/embedFaqs.js)
 * and when embedding a live user question (services/retrieval.js).
 */
async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values;
}

module.exports = { embedText };
