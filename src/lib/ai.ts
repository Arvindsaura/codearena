import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

type ReviewType = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  complexityAnalysis: { time: string; space: string };
  improvements: string[];
  alternateApproaches: string[];
  verdict: string;
};

export async function analyzeCode(code: string): Promise<{
  codeQuality: number;
  complexityScore: number;
  finalScore: number;
  review: ReviewType;
  formattedReview: string;
  algorithmElegance?: number;
  approachCleverness?: number;
  codeStructure?: number;
  optimizationLevel?: number;
  robustness?: number;
  patternUsage?: number;
  constraintHandling?: number;
  codeClarity?: number;
  microOptimizations?: number;
  riskFactor?: number;
}> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert competitive programming reviewer. Return ONLY JSON.",
        },
        {
          role: "user",
          content: getPrompt(code),
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback in case it includes markdown backticks
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/);
      const rawJson = jsonMatch ? jsonMatch[1] : responseText;
      parsed = JSON.parse(rawJson);
    }

    const get = (val: any, def = 5) => (typeof val === "number" ? val : def);

    const algorithmElegance = get(parsed.algorithmElegance);
    const approachCleverness = get(parsed.approachCleverness);
    const codeStructure = get(parsed.codeStructure);
    const optimizationLevel = get(parsed.optimizationLevel);
    const robustness = get(parsed.robustness);
    const patternUsage = get(parsed.patternUsage);
    const constraintHandling = get(parsed.constraintHandling);
    const codeClarity = get(parsed.codeClarity);
    const microOptimizations = get(parsed.microOptimizations);
    const riskFactor = get(parsed.riskFactor);

    // 🎯 Code Quality
    const codeQuality = Number(
      (
        0.2 * algorithmElegance +
        0.15 * approachCleverness +
        0.1 * codeStructure +
        0.1 * codeClarity +
        0.1 * microOptimizations +
        0.15 * optimizationLevel +
        0.1 * robustness +
        0.1 * riskFactor
      ).toFixed(2)
    );

    // ⚡ Complexity
    const complexityScore = Number((0.6 * optimizationLevel + 0.4 * algorithmElegance).toFixed(2));

    // 🏆 Final Score
    const baseFinal = 0.5 * codeQuality + 0.3 * complexityScore + 0.2 * constraintHandling;

    const finalScore = Number(baseFinal.toFixed(2));

    console.log(`📊 AI EVALUATION (GROQ):`, {
      algorithmElegance,
      approachCleverness,
      codeStructure,
      optimizationLevel,
      robustness,
      patternUsage,
      constraintHandling,
      codeClarity,
      microOptimizations,
      riskFactor,
      RESULT: { codeQuality, complexityScore, finalScore },
    });

    // 🧠 Safe Review Parsing
    const reviewRaw = parsed.review || {};
    const review: ReviewType = {
      summary: reviewRaw.summary || "No summary provided.",
      strengths: reviewRaw.strengths || [],
      weaknesses: reviewRaw.weaknesses || [],
      complexityAnalysis: reviewRaw.complexityAnalysis || {
        time: "Unknown",
        space: "Unknown",
      },
      improvements: reviewRaw.improvements || [],
      alternateApproaches: reviewRaw.alternateApproaches || [],
      verdict: reviewRaw.verdict || "Unknown",
    };

    // 🎨 Markdown Formatting
    const formattedReview = `
### 🧠 SUMMARY
${review.summary}

### ✅ STRENGTHS
${review.strengths.map((s) => `• **${s.split(':')[0]}**: ${s.split(':').slice(1).join(':') || s}`).join("\n\n")}

### ❌ CRITICAL WEAKNESSES
${review.weaknesses.map((w) => `• **${w.split(':')[0]}**: ${w.split(':').slice(1).join(':') || w}`).join("\n\n")}

### ⚡ COMPLEXITY ANALYSIS
- **Time Complexity**: \`${review.complexityAnalysis.time}\`
- **Space Complexity**: \`${review.complexityAnalysis.space}\`

### 💡 ALTERNATE APPROACHES
${review.alternateApproaches.length > 0 ? review.alternateApproaches.map((a) => `• ${a}`).join("\n\n") : "• No significant alternative discovered."}

### 🔧 TECHNICAL IMPROVEMENTS
${review.improvements.map((i) => `• ${i}`).join("\n\n")}

### 🏆 ARCHITECTURAL VERDICT
**${review.verdict.toUpperCase()}**
`;

    return {
      codeQuality,
      complexityScore,
      finalScore,
      review,
      formattedReview,
      algorithmElegance,
      approachCleverness,
      codeStructure,
      optimizationLevel,
      robustness,
      patternUsage,
      constraintHandling,
      codeClarity,
      microOptimizations,
      riskFactor
    };
  } catch (error) {
    console.error("Groq Error:", error);
    return {
      codeQuality: 5.0,
      complexityScore: 5.0,
      finalScore: 5.0,
      review: {
        summary: "AI review unavailable.",
        strengths: [],
        weaknesses: [],
        complexityAnalysis: { time: "Unknown", space: "Unknown" },
        improvements: [],
        alternateApproaches: [],
        verdict: "Unknown",
      },
      formattedReview: "AI review unavailable.",
    };
  }
}

function getPrompt(code: string) {
  return `
You are an elite competitive programming architect and technical interviewer. Your task is to perform a deep-dive analysis of the provided code.

CRITICAL CONSTRAINTS:
1. **NO FLUFF**: Do not mention lack of comments, documentation, or variable naming unless they are confusingly wrong.
2. **REAL ISSUES ONLY**: Focus on algorithmic bottlenecks, time/space complexity, memory leaks, edge case failures, and logical errors.
3. **ADVANCED INSIGHTS**: Suggest optimizations that a senior engineer or high-rated competitive programmer would suggest (e.g., bit manipulation, DP state reduction, segment trees, better STL usage).
4. **STRUCTURE**: The "strengths" and "weaknesses" MUST follow the format "Category: Detail".

SCORING (0.0 to 10.0):
- algorithmElegance: How refined is the core logic?
- approachCleverness: Is it a standard solution or a creative one?
- codeStructure: Is the logic flow architectural and clean?
- optimizationLevel: How well are resources managed?
- robustness: Does it handle MAX_INT, empty inputs, etc.?
- constraintHandling: Is it optimized for the typical N=10^5 constraints?
- microOptimizations: Use of inline, fast I/O, cache-friendly loops.

JSON FORMAT:
{
  "algorithmElegance": number,
  "approachCleverness": number,
  "codeStructure": number,
  "optimizationLevel": number,
  "robustness": number,
  "patternUsage": number,
  "constraintHandling": number,
  "codeClarity": number,
  "microOptimizations": number,
  "riskFactor": number,
  "review": {
    "summary": "High-level architectural summary",
    "strengths": ["Category: Insight", "Category: Insight"],
    "weaknesses": ["Algorithm: Flaw", "Logic: Edge case vulnerability"],
    "complexityAnalysis": { "time": "O(...)", "space": "O(...)" },
    "improvements": ["Specific code change 1", "Specific code change 2"],
    "alternateApproaches": ["Detailed description of an alternative O(...) approach"],
    "verdict": "Beginner / Intermediate / Advanced / Expert"
  }
}

CODE TO ANALYZE:
\`\`\`
${code}
\`\`\`
`;
}