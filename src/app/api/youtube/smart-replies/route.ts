import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface JwtPayload {
  userId: string;
}

interface CommentInput {
  id: string;
  text: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  videoId: string;
  videoTitle: string;
  likeCount?: number;
}

async function generateSmartReplies(
  comments: CommentInput[],
  channelTitle: string
): Promise<Record<string, { reply: string; intent: string; emoji: string; priority: "high" | "medium" | "low" }>> {
  // Check if this is demo mode
  const isDemoMode = comments.every(c => c.id.startsWith("demo-"));
  
  if (isDemoMode) {
    // Return demo replies for demo comments
    return comments.reduce((acc, comment) => {
      const lowerText = comment.text.toLowerCase();
      let reply = "";
      let intent = "other";
      let emoji = "💬";
      let priority: "high" | "medium" | "low" = "medium";
      
      // Generate contextual demo replies based on comment content
      if (lowerText.includes("?") || lowerText.includes("how") || lowerText.includes("what")) {
        reply = "Great question! I cover this in more detail in my upcoming video. Stay tuned! 🚀";
        intent = "question";
        emoji = "❓";
        priority = "high";
      } else if (lowerText.includes("thank") || lowerText.includes("great") || lowerText.includes("awesome")) {
        reply = "Thank you so much for the kind words! Means a lot to me. 🙏";
        intent = "praise";
        emoji = "🌟";
        priority = "medium";
      } else if (lowerText.includes("subscribe") || lowerText.includes("first")) {
        reply = "SKIP";
        intent = "spam";
        emoji = "🚫";
        priority = "low";
      } else if (lowerText.includes("suggestion") || lowerText.includes("should")) {
        reply = "That's a fantastic suggestion! I'll definitely consider this for future content. Thanks! 💡";
        intent = "suggestion";
        emoji = "💡";
        priority = "medium";
      } else if (lowerText.includes("error") || lowerText.includes("issue") || lowerText.includes("problem")) {
        reply = "Thanks for the feedback! I'll look into this and improve in future videos. 🎯";
        intent = "criticism";
        emoji = "⚠️";
        priority = "high";
      } else {
        reply = "Appreciate you taking the time to comment! Keep watching for more content. 🔥";
        intent = "other";
        emoji = "💬";
        priority = "low";
      }
      
      acc[comment.id] = { reply, intent, emoji, priority };
      return acc;
    }, {} as Record<string, { reply: string; intent: string; emoji: string; priority: "high" | "medium" | "low" }>);
  }

  // Real API call for non-demo mode
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `You are an AI that helps YouTube creators reply to comments authentically.
Channel: "${channelTitle}"

For each comment below, generate:
1. A SHORT, HUMAN, authentic reply (max 2 sentences) that sounds natural — NOT corporate or robotic. Match the comment's energy (funny → be funny, serious → be thoughtful, question → answer clearly).
2. The comment's INTENT: one of: "question", "praise", "criticism", "suggestion", "spam", "other"
3. An EMOJI that fits the vibe of the comment (1 emoji only)
4. A PRIORITY: "high" (direct question or viral comment), "medium" (praise/suggestion), "low" (generic or spam)

Comments (JSON array):
${JSON.stringify(comments.map(c => ({ id: c.id, text: c.text, author: c.author })))}

Return ONLY a JSON object where keys are comment IDs and values are:
{
  "reply": "your reply text",
  "intent": "question|praise|criticism|suggestion|spam|other",
  "emoji": "one emoji",
  "priority": "high|medium|low"
}

Rules:
- Replies must sound like a real person, not a bot
- For questions: answer briefly AND invite follow-up
- For praise: be grateful and personal
- For criticism: be gracious, acknowledge, and improve
- For suggestions: validate and say if you'll consider it
- For spam: write "SKIP" as the reply
- Keep all replies under 120 characters
- Do not include the author's name in reply (YouTube does that automatically)`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Return empty map on parse failure
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    const body = await request.json();
    const { comments, channelTitle: bodyChannelTitle } = body as { 
      comments: CommentInput[]; 
      channelTitle?: string;
    };

    if (!comments || comments.length === 0) {
      return NextResponse.json({ replies: {} });
    }

    // Check if this is demo mode (all comment IDs start with "demo-")
    const isDemoMode = comments.every(c => c.id.startsWith("demo-"));

    let channelTitle = bodyChannelTitle || "your channel";

    if (!isDemoMode) {
      // Only check authentication for real comments
      if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      await connectDB();
      const user = await User.findById(decoded.userId.toString());

      if (!user || !user.youtubeAccessToken) {
        return NextResponse.json({ error: "YouTube not connected" }, { status: 400 });
      }
      channelTitle = user.youtubeChannelTitle || "your channel";
    }

    // Limit to 30 comments per batch to keep Gemini prompt small
    const batch = comments.slice(0, 30);

    const replies = await generateSmartReplies(batch, channelTitle);

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Smart Replies error:", error);
    return NextResponse.json({ error: "Failed to generate replies" }, { status: 500 });
  }
}
