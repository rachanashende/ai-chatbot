const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Converts a piece of text into an embedding vector using Gemini's
 * embedding model. Used both when pre-embedding FAQs (scripts/embedFaqs.js)
 * and when embedding a live user question (services/retrieval.js).
 *
 * gemini-embedding-001 defaults to 3072 dimensions — we truncate to 768
 * via outputDimensionality, which keeps storage/comparison cheap while
 * still being one of Google's recommended sizes for quality. Just make
 * sure this stays consistent between indexing and querying, since vectors
 * of different lengths can't be compared.
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