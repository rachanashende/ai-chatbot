const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends the assembled prompt (FAQ context + campus context + question)
 * to Gemini and returns the plain text answer.
 */
async function generateAnswer(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateAnswer };
