import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface JwtPayload {
  userId: string;
}

export async function GET() {
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

    // Fetch Channel Statistics
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const channelData = await channelRes.json();
    const stats = channelData.items?.[0]?.statistics;

    if (!stats) {
        return NextResponse.json({ error: "Stats not found" }, { status: 404 });
    }

    return NextResponse.json({
        totalComments: parseInt(stats.commentCount || "0"),
        totalSubscribers: parseInt(stats.subscriberCount || "0"),
        totalVideos: parseInt(stats.videoCount || "0"),
        avgSentiment: "86%", // Placeholder for now
        vibe: "Growing",     // Placeholder
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
