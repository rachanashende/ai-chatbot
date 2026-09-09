const fs = require("fs");
const path = require("path");
const { retrieveTopMatches } = require("./retrieval");

const campusProfile = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/campus-profile.json"), "utf-8")
);

/**
 * Builds the full prompt sent to Gemini for a given user question.
 *
 * Tier logic:
 *  - "FAQ"        -> one or more FAQ matches cleared the similarity threshold.
 *                    The model is told to answer directly from them.
 *  - "CampusInfo" -> no FAQ matched confidently. The model reasons from the
 *                    general campus-profile context instead, and is told to
 *                    say so if even that isn't enough to answer safely.
 *
 * The returned `tier` is what the frontend uses to pick which tag/color
 * to show next to the answer (see client/src/components/MessageBubble.jsx).
 */
async function buildPrompt(userQuestion) {
  const matches = await retrieveTopMatches(userQuestion);

  const faqContext = matches
    .map((m) => `Q: ${m.question}\nA: ${m.answer}`)
    .join("\n\n");

  const tier = matches.length > 0 ? "FAQ" : "CampusInfo";

  const prompt = `You are Campus Companion, an assistant for ${campusProfile.college_name}.
You only answer questions about this college — admissions, registration, exams, and campus life.

FAQ MATCHES (use these directly if relevant):
${faqContext || "None found for this question."}

GENERAL CAMPUS CONTEXT (use only if it genuinely supports an answer):
${JSON.stringify(campusProfile, null, 2)}

Rules:
- If the FAQ matches answer the question, use them as your primary source.
- If not, you may reason from the general campus context, but do not invent
  specifics (dates, fees, policies) that aren't actually in the context.
- If you don't have enough grounded information to answer confidently,
  say so plainly and point the student to the relevant contact from
  the campus context instead of guessing.
- Keep answers concise and direct — students are usually checking this
  quickly, not reading a full explanation.

Student question: ${userQuestion}`;

  return { tier, prompt, matchedFaqs: matches.map((m) => m.id) };
}

module.exports = { buildPrompt };
