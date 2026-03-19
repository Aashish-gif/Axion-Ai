import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


export interface AIReport {
  sentimentScore: number;
  goodPoints: string[];
  improvPoints: string[];
  flagPoints: string[];
  questions: string[];
  nextVideoIdea: string;
  whatIsGreat: string;
  whatIsBad: string;
}

const SYSTEM_PROMPT = `
You are a YouTube Audience Analyst. Analyze the provided comments and video statistics to generate a detailed, unique report for THIS SPECIFIC video.
DO NOT use generic phrases. Every point must be derived from the actual comments or stats provided.

Return ONLY a JSON object with the following structure:
{
  "sentimentScore": number (0-100),
  "goodPoints": string[] (3-5 specific points),
  "improvPoints": string[] (3-5 actionable points),
  "flagPoints": string[] (any red flags like spam or hate, or empty array),
  "questions": string[] (top 5 unique questions from comments),
  "nextVideoIdea": string (a creative, high-potential idea based on audience gaps),
  "whatIsGreat": string (2-3 sentences summarizing the biggest strengths),
  "whatIsBad": string (2-3 sentences summarizing the biggest weaknesses or missing elements)
}

Guidelines:
- Be specific: Mention specific topics or feedback from the comments.
- Sentiment: Base the score strictly on comment tone.
- Ideas: If people ask "how to", "why", or "more about X", base the next video idea on that.
- Diversity: Ensure the report feels custom-made for the video title and content.
`;

export async function generateAIReport(comments: string[], stats: any): Promise<AIReport> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nComments: ${JSON.stringify(comments)}\nStats: ${JSON.stringify(stats)}`;
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    
    // Clean-up Gemini response if it includes markdown code blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const report = JSON.parse(jsonStr) as AIReport;

    // Ensure we have at least some data
    return {
      sentimentScore: report.sentimentScore || 70,
      goodPoints: report.goodPoints || [],
      improvPoints: report.improvPoints || [],
      flagPoints: report.flagPoints || [],
      questions: report.questions || [],
      nextVideoIdea: report.nextVideoIdea || "Continue your series",
      whatIsGreat: report.whatIsGreat || "Great audience engagement.",
      whatIsBad: report.whatIsBad || "No major issues reported."
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
