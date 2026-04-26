import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeCode(code: string): Promise<{ codeQuality: number; complexityScore: number; review: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
You are an expert competitive programming code reviewer. Analyze the following code and provide a JSON response with:

1. "code_quality": A score between 1 and 3 (1 = poor, 2 = acceptable, 3 = excellent). Consider readability, naming conventions, and best practices.
2. "complexity_score": A score between 0 and 5 (0 = very poor algorithmic complexity, 5 = optimal). Consider time and space complexity.
3. "review": A concise but helpful code review (3-5 bullet points). Include:
   - What the code does well
   - What could be improved (variable naming, edge cases, redundancy)
   - Time & space complexity analysis (e.g. "O(n) time, O(1) space")
   - A specific suggestion for a better approach if one exists

Use markdown formatting for the review (bullet points with **bold** labels).

Return ONLY a valid JSON object matching this schema:
{
  "code_quality": number,
  "complexity_score": number,
  "review": "string with markdown"
}

Code:
\`\`\`
${code}
\`\`\`
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON block in case it comes with markdown formatting
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/);
    const rawJson = jsonMatch ? jsonMatch[1] : responseText;
    
    const parsed = JSON.parse(rawJson);
    return {
      codeQuality: parsed.code_quality || 1,
      complexityScore: parsed.complexity_score || 0,
      review: parsed.review || "No review generated."
    };
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback gracefully
    return { codeQuality: 2, complexityScore: 2, review: "AI review unavailable for this submission." };
  }
}
