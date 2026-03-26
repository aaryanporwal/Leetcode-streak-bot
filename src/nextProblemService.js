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
 * @param {string} userId - Discord user ID
 * @param {string[]} excludeIds - List of problem IDs to exclude (optional)
 * @param {boolean} randomRecommend - If true, ask for a random recommendation (optional)
 */
async function getNextProblem(
  userId,
  excludeIds = [],
  randomRecommend = false
) {
  const solvedQuestions = getUserSolvedQuestions(userId);
  const userStats = getUserStats(userId);

  if (!userStats || solvedQuestions.length === 0) {
    if (!randomRecommend) return null; // Can still recommend random if needed
  }

  // Build a list of solved problem names for matching
  const solvedNames = solvedQuestions
    ? solvedQuestions.map((q) => q.question_name)
    : [];

  // Filter the dataset to exclude already solved problems (and specifically excluded ones)
  const solvedLower = solvedNames.map((n) => n.toLowerCase().trim());
  const candidateProblems = LEETCODE_PROBLEMS.filter(
    (p) =>
      !excludeIds.includes(p.id) &&
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

  let prompt;
  if (randomRecommend) {
    prompt = `You are a LeetCode coach. Your job is to recommend exactly ONE RANDOM problem for a user to solve next from the available list.
    
    ## Available Candidate Problems (ONLY pick from this list)
    ${JSON.stringify(candidateProblems.slice(0, 100), null, 2)}
    
    ## Logic
    - Pick ONE problem at random.
    - Match ID, title, difficulty, and topics EXACTLY.`;
  } else {
    prompt = `You are a strict, data-driven LeetCode coach. Your job is to recommend exactly ONE problem for a user to solve next.

## User Data

**Solved Problems (most recent first):**
${solvedNames.length > 0 ? solvedNames.map((name, i) => `${i + 1}. ${name}`).join("\n") : "No problems solved yet."}

**User Stats:**
- Current streak: ${userStats ? userStats.streak : 0} day(s)
- Longest streak: ${userStats ? userStats.longest_streak : 0} day(s)
- Total questions solved: ${userStats ? userStats.questions_solved : 0}

## Available Candidate Problems (ONLY pick from this list)

${JSON.stringify(candidateProblems.slice(0, 100), null, 2)}

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
  }

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

  const modelsToTry = [
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
  ];
  let response;
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: randomRecommend ? 0.7 : 0.2, // Higher temperature for random
          responseMimeType: "application/json",
          responseJsonSchema: responseSchema, // Gemini supports structured output
        },
      });
      if (response) {
        if (lastError) {
          console.log(`Successfully recovered using model ${modelName}.`);
        }
        break; // Success!
      }
    } catch (error) {
      if (error.status !== 503) {
        throw error;
      }
      lastError = error;
      console.warn(`Model ${modelName} busy (503), trying next...`);
    }
  }

  if (!response) {
    throw lastError; // Re-throw the last error if all models failed
  }

  const text = JSON.parse(response.text);
  const recommended = text.recommended_problem;

  // Validate that the recommended problem exists in our dataset
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
    const fallback =
      candidateProblems[Math.floor(Math.random() * candidateProblems.length)];
    return {
      recommended_problem: fallback,
      reasoning: randomRecommend
        ? "AI recommendation was invalid; here is a random problem for you."
        : "AI recommendation was invalid; here is the next available problem for you.",
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
    reasoning: text.reasoning,
  };
}

module.exports = { getNextProblem };
