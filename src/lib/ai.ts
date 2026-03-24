import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini initialization will happen inside the function to ensure env vars are loaded.
export interface AIReport {
  sentimentScore: number;
  goodPoints: string[];
  improvPoints: string[];
  flagPoints: string[];
  questions: string[];
  nextVideoIdea: string;
  whatIsGreat: string;
  whatIsBad: string;
  overallSummary: string;
}

const SYSTEM_PROMPT = `
You are a YouTube Audience Analyst. Analyze the provided comments and video statistics to generate a detailed, PUNCHY, and unique report for THIS SPECIFIC video.
DO NOT use generic phrases. Every point must be derived from the actual comments or stats provided. Focus on real-time feedback and actionable summaries.

Be HONEST and CRITICAL. If the video has issues (disengagement, confusion, repetitive complaints, clickbait frustration), highlight them as Red Flags. Don't sugarcoat.

Return ONLY a JSON object with the following structure:
{
  "sentimentScore": number (0-100),
  "goodPoints": string[] (3-5 short, punchy points),
  "improvPoints": string[] (3-5 actionable, concise points identifying specific growth blockers),
  "flagPoints": string[] (Brutally honest red flags: viewer confusion, disengagement, toxic patterns, or empty array),
  "questions": string[] (top 5 unique questions from comments),
  "nextVideoIdea": string (a creative, high-potential idea based on audience gaps),
  "whatIsGreat": string (1-2 punchy sentences summarizing the biggest strengths),
  "whatIsBad": string (1-2 punchy sentences summarizing the biggest weaknesses or missing elements),
  "overallSummary": string (A comprehensive 3-4 sentence paragraph summarizing the video's performance, audience reception, and key takeaways.)
}

Guidelines:
- If NO comments are provided (Comments: []), generate the report based strictly on the video Title and Stats (views, likes). Mention that the feedback is based on performance trends.
- Be specific: Mention specific topics or feedback from the comments.
- Red Flags: Look for keywords like "too long", "confusing", "why did you", "boring", "skipping", or technical complaints.
- Sentiment: Base the score strictly on comment tone. If no comments, use a neutral/starting score (70).
- Ideas: If people ask "how to", "why", or "more about X", base the next video idea on that.
- Diversity: Ensure the report feels custom-made for the video title and content.
`;

export async function generateAIReport(comments: string[], stats: any): Promise<AIReport> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `${SYSTEM_PROMPT}\n\nComments: ${JSON.stringify(comments.slice(0, 50))}\nStats: ${JSON.stringify(stats)}`;
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini Raw Response:", text);
    
    // Clean-up Gemini response if it includes markdown code blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let report;
    try {
      report = JSON.parse(jsonStr) as AIReport;
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", jsonStr);
      throw parseError;
    }

    console.log("Parsed AI Report:", report);

    // Ensure we have at least some data
    return {
      sentimentScore: report.sentimentScore || 70,
      goodPoints: report.goodPoints || [],
      improvPoints: report.improvPoints || [],
      flagPoints: report.flagPoints || [],
      questions: report.questions || [],
      nextVideoIdea: report.nextVideoIdea || "Continue your series",
      whatIsGreat: report.whatIsGreat || "Great audience engagement.",
      whatIsBad: report.whatIsBad || "No major issues reported.",
      overallSummary: report.overallSummary || "The video is performing well with steady engagement from the audience."
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
