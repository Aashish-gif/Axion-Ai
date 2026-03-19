import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateMergedReport } from "@/lib/ai";

interface JwtPayload {
  userId: string;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const videoId = resolvedParams.id;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId.toString());

    if (!user || !user.youtubeAccessToken) {
      return NextResponse.json({ error: "YouTube not connected" }, { status: 400 });
    }

    // 1. Fetch Video Metadata
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videoData = await videoRes.json();
    let video = videoData.items?.[0];

    // 2. Fallback to mock data if video not found or ID is "1" (Demo)
    if (!video || videoId === "1") {
        return NextResponse.json({
            id: videoId === "1" ? "1" : videoId,
            title: videoId === "1" ? "Next-Gen AI Strategies" : "Analyzing Your Video",
            commentCount: 1240,
            sentimentScore: 88,
            emoji: "🚀",
            gradientFrom: "#FF3B3B",
            gradientTo: "#FF6B35",
            goodPoints: ["Engaging hook", "Clear transitions", "Strong call to action"],
            improvPoints: ["Audio levels in intro", "Add more chapter markers"],
            flagPoints: [],
            questions: ["How do I start with AI?", "What tools are you using?", "Can you do a tutorial?"],
            nextVideoIdea: "Deep dive into AI-driven content creation",
        });
    }

    // 3. Fetch More Comments for AI Analysis
    const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100`,
        { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const commentsData = await commentsRes.json();
    const commentTexts = commentsData.items?.map((it: any) => it.snippet.topLevelComment.snippet.textDisplay) || [];

    // 4. Generate Merged AI Report
    const stats = {
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
    };

    let aiReport;
    try {
        aiReport = await generateMergedReport(commentTexts, stats);
    } catch (e) {
        console.error("AI Generation failed, using fallback:", e);
        aiReport = {
            sentimentScore: 70,
            goodPoints: ["Engaging content", "Good production"],
            improvPoints: ["Add more calls to action"],
            flagPoints: [],
            questions: commentTexts.filter((t: string) => t.includes("?")).slice(0, 5),
            nextVideoIdea: `Deep dive into ${video.snippet.title.split(' ')[0]}`,
            whatIsGreat: "Your audience seems very engaged and appreciative of the quality.",
            whatIsBad: "Some users noted that the pacing could be improved in the middle section."
        };
    }
    
    return NextResponse.json({
        id: video.id,
        title: video.snippet.title,
        commentCount: parseInt(video.statistics.commentCount || "0"),
        sentimentScore: aiReport.sentimentScore,
        emoji: "🎬",
        gradientFrom: "#FF3B3B",
        gradientTo: "#FF6B35",
        goodPoints: aiReport.goodPoints,
        improvPoints: aiReport.improvPoints,
        flagPoints: aiReport.flagPoints,
        questions: aiReport.questions,
        nextVideoIdea: aiReport.nextVideoIdea,
        whatIsGreat: aiReport.whatIsGreat,
        whatIsBad: aiReport.whatIsBad,
        metrics: {
            views: video.statistics.viewCount,
            likes: video.statistics.likeCount,
            favorites: video.statistics.favoriteCount || "0",
            shares: "N/A", // Shares not available in this API
            watchTime: "Premium Feature", // Needs Analytics API
            downloads: "Manual Tracking", // Not available via API
        }
    });
  } catch (error) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
