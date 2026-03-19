import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
You are a YouTube Audience Analyst. Analyze the provided comments and video statistics to generate a detailed report.
Return ONLY a JSON object with the following structure:
{
  "sentimentScore": number (0-100),
  "goodPoints": string[],
  "improvPoints": string[],
  "flagPoints": string[],
  "questions": string[],
  "nextVideoIdea": string,
  "whatIsGreat": string,
  "whatIsBad": string
}
Keep points concise and actionable. "whatIsGreat" and "whatIsBad" should be a summary paragraph each.
`;

async function getOpenAIReport(comments: string[], stats: any): Promise<AIReport | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Comments: ${JSON.stringify(comments)}\nStats: ${JSON.stringify(stats)}` },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content || "{}") as AIReport;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return null;
  }
}

async function getGeminiReport(comments: string[], stats: any): Promise<AIReport | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nComments: ${JSON.stringify(comments)}\nStats: ${JSON.stringify(stats)}`;
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    // Clean-up Gemini response if it includes markdown code blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr) as AIReport;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function generateMergedReport(comments: string[], stats: any): Promise<AIReport> {
  const [openAIReport, geminiReport] = await Promise.all([
    getOpenAIReport(comments, stats),
    getGeminiReport(comments, stats),
  ]);

  if (!openAIReport && !geminiReport) {
    throw new Error("Both AI models failed to generate a report");
  }

  // Merging Logic
  const merged: AIReport = {
    sentimentScore: 0,
    goodPoints: [],
    improvPoints: [],
    flagPoints: [],
    questions: [],
    nextVideoIdea: "",
    whatIsGreat: "",
    whatIsBad: "",
  };

  if (openAIReport && geminiReport) {
    merged.sentimentScore = Math.round((openAIReport.sentimentScore + geminiReport.sentimentScore) / 2);
    merged.goodPoints = Array.from(new Set([...openAIReport.goodPoints, ...geminiReport.goodPoints])).slice(0, 5);
    merged.improvPoints = Array.from(new Set([...openAIReport.improvPoints, ...geminiReport.improvPoints])).slice(0, 5);
    merged.flagPoints = Array.from(new Set([...openAIReport.flagPoints, ...geminiReport.flagPoints]));
    merged.questions = Array.from(new Set([...openAIReport.questions, ...geminiReport.questions])).slice(0, 8);
    merged.nextVideoIdea = openAIReport.nextVideoIdea; // Default to OpenAI for idea or combine?
    merged.whatIsGreat = openAIReport.whatIsGreat;
    merged.whatIsBad = geminiReport.whatIsBad; // Mix them up
  } else {
    const report = openAIReport || geminiReport!;
    Object.assign(merged, report);
  }

  return merged;
}
