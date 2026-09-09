const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends the assembled prompt (FAQ context + campus context + question)
 * to Gemini and returns the plain text answer.
 *
 * Retries on 503 (model temporarily overloaded on Google's side) with
 * short exponential backoff. Any other error type is thrown immediately.
 */
async function generateAnswer(prompt, retries = 3) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const isOverloaded = err.message?.includes("503");
      const isLastAttempt = attempt === retries;

      if (!isOverloaded || isLastAttempt) throw err;

      const waitMs = 1000 * 2 ** attempt; // 1s, 2s, 4s
      console.warn(`Gemini overloaded, retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
      await sleep(waitMs);
    }
  }
}

module.exports = { generateAnswer };