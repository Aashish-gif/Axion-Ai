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

    // 1. Get uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&mine=true`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
       return NextResponse.json({ videos: [] });
    }

    // 2. Get recent videos from uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=9`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const playlistData = await playlistRes.json();
    const vItems = playlistData.items || [];
    const videoIds = vItems.map((item: any) => item.snippet.resourceId.videoId).join(",");

    // 3. Get detailed statistics for these videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videosData = await videosRes.json();

    const videos = videosData.items?.map((item: any, index: number) => {
        // Generate stable-ish mock sentiment for the UI
        const sentimentScore = 70 + (parseInt(item.statistics.commentCount || "0") % 25);
        const emojis = ["🚀", "💻", "📸", "🎨", "💰", "🤖", "🎬", "🔥", "✨"];
        
        return {
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            commentCount: parseInt(item.statistics.commentCount || "0"),
            sentimentScore: sentimentScore,
            emoji: emojis[index % emojis.length],
            // Gradients for the UI cards
            gradientFrom: index % 2 === 0 ? "#FF3B3B" : "#3B82F6",
            gradientTo: index % 2 === 0 ? "#FF6B35" : "#2DD4BF",
        };
    }) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
