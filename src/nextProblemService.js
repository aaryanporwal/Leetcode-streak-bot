const { GoogleGenAI } = require("@google/genai");
const db = require("./db.js");
const LEETCODE_PROBLEMS = require("../dataset/leetcodeProblems.js");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Get all questions solved by a user, ordered by most recent first.
 */
function getUserSolvedQuestions(userId) {
  return db
    .prepare(
      `SELECT question_name, timestamp FROM user_questions
       WHERE user_id = ?
       ORDER BY timestamp DESC`
    )
    .all(userId);
}

/**
 * Get user stats (streak, longest_streak, questions_solved).
 */
function getUserStats(userId) {
  return db.prepare(`SELECT * FROM users WHERE user_id = ?`).get(userId);
}

/**
 * Build the prompt and call Gemini to get a single problem recommendation.
 * Returns the parsed JSON response from Gemini.
 */
async function getNextProblem(userId) {
  const solvedQuestions = getUserSolvedQuestions(userId);
  const userStats = getUserStats(userId);

  if (!userStats || solvedQuestions.length === 0) {
    return null; // No data to reason from
  }

  // Build a list of solved problem names for matching
  const solvedNames = solvedQuestions.map((q) => q.question_name);

  // Filter the dataset to exclude already solved problems (fuzzy match on title)
  const solvedLower = solvedNames.map((n) => n.toLowerCase().trim());
  const candidateProblems = LEETCODE_PROBLEMS.filter(
    (p) =>
      !solvedLower.some(
        (s) =>
          s === p.title.toLowerCase() ||
          s.includes(p.title.toLowerCase()) ||
          p.title.toLowerCase().includes(s)
      )
  );

  if (candidateProblems.length === 0) {
    return { error: "all_solved" };
  }

  const prompt = `You are a strict, data-driven LeetCode coach. Your job is to recommend exactly ONE problem for a user to solve next.

## User Data

**Solved Problems (most recent first):**
${solvedNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

**User Stats:**
- Current streak: ${userStats.streak} day(s)
- Longest streak: ${userStats.longest_streak} day(s)
- Total questions solved: ${userStats.questions_solved}

## Available Candidate Problems (ONLY pick from this list)

${JSON.stringify(candidateProblems, null, 2)}

## Decision Logic (follow EXACTLY)

1. **Identify weakest topic**: Analyze the solved problems and determine which important DSA topics the user has NOT practiced or practiced the LEAST. Consider all major topics: Arrays, Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Graphs, Dynamic Programming, Backtracking, Heap, Greedy, Intervals, Trie, Bit Manipulation.

2. **Difficulty selection**:
   - If the user has a low streak (1-2 days) or few problems solved (< 5), prefer Easy or easy Medium problems.
   - If the user is consistent (streak >= 3, solved >= 10), push them slightly above comfort level.
   - Default target: slightly above current comfort level, prefer Medium.

3. **Filter and rank candidates**:
   - HIGHEST priority: Topic match (weakest topic)
   - SECOND priority: Appropriate difficulty
   - Pick the SINGLE best candidate.

4. **Return EXACTLY ONE problem from the candidate list above.**

IMPORTANT: The id, title, difficulty, and topics in your response MUST exactly match one entry from the candidate list. Do NOT invent or modify problem details.`;

  // Structured output schema (raw JSON Schema)
  const responseSchema = {
    type: "object",
    properties: {
      recommended_problem: {
        type: "object",
        properties: {
          id: { type: "string", description: "LeetCode problem ID" },
          title: { type: "string", description: "Exact problem title" },
          difficulty: {
            type: "string",
            description: "Easy, Medium, or Hard",
          },
          topics: {
            type: "array",
            items: { type: "string" },
            description: "Problem topics",
          },
        },
        required: ["id", "title", "difficulty", "topics"],
      },
      reasoning: {
        type: "string",
        description:
          "Short explanation (max 2 sentences) for why this problem was chosen",
      },
    },
    required: ["recommended_problem", "reasoning"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseJsonSchema: responseSchema, // Gemini supports structured output
    },
  });

  const text = response.text;
  const parsed = JSON.parse(text);

  // Validate that the recommended problem exists in our dataset
  const recommended = parsed.recommended_problem;
  const match = candidateProblems.find(
    (p) =>
      p.id === recommended.id ||
      p.title.toLowerCase() === recommended.title.toLowerCase()
  );

  if (!match) {
    // Fallback: pick the first candidate in the weakest topic area
    // This should rarely happen with structured output
    console.warn(
      "Gemini recommended a problem not in the dataset, using fallback."
    );
    const fallback = candidateProblems[0];
    return {
      recommended_problem: fallback,
      reasoning:
        "AI recommendation was invalid; here is the next available problem for you.",
    };
  }

  // Ensure we return the exact data from our dataset
  return {
    recommended_problem: {
      id: match.id,
      title: match.title,
      difficulty: match.difficulty,
      topics: match.topics,
    },
    reasoning: parsed.reasoning,
  };
}

module.exports = { getNextProblem };
