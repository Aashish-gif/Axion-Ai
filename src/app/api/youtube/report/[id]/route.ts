import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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
    const user = await User.findById(decoded.userId);

    if (!user || !user.youtubeAccessToken) {
      return NextResponse.json({ error: "YouTube not connected" }, { status: 400 });
    }

    // 1. Fetch Video Metadata
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videoData = await videoRes.json();
    const video = videoData.items?.[0];

    if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // 2. Fetch Top Comments for "AI Analysis" simulation
    const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20`,
        { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const commentsData = await commentsRes.json();
    const commentTexts = commentsData.items?.map((it: any) => it.snippet.topLevelComment.snippet.textDisplay) || [];

    // 3. Simple Analysis Simulation (Replace with Gemini/AI later)
    const sentimentScore = 75 + (commentTexts.length % 20);
    const questions = commentTexts.filter((t: string) => t.includes("?")).slice(0, 5);
    
    return NextResponse.json({
        id: video.id,
        title: video.snippet.title,
        commentCount: parseInt(video.statistics.commentCount || "0"),
        sentimentScore,
        emoji: "🎬",
        gradientFrom: "#FF3B3B",
        gradientTo: "#FF6B35",
        goodPoints: ["Engaging title", "High audience retention", "Positive feedback on visual quality"],
        improvPoints: ["Audio clarity in intro", "Add more links to description"],
        flagPoints: [],
        questions: questions.length > 0 ? questions : ["Can you explain the setup process more?", "What gear do you use?"],
        nextVideoIdea: `Deep dive into ${video.snippet.title.split(' ')[0]} strategies`,
    });
  } catch (error) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
