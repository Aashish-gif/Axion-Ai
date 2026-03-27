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
      return NextResponse.json({ 
        error: "Not authenticated",
        message: "Please log in to access your videos"
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId.toString());

    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        message: "Please log in again"
      }, { status: 404 });
    }

    if (!user.youtubeAccessToken) {
      return NextResponse.json({ 
        error: "YouTube not connected",
        message: "Please connect your YouTube channel first",
        youtubeConnected: false
      }, { status: 400 });
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

    // 3. Get detailed statistics and snippets for these videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videosData = await videosRes.json();

    const videoItems = videosData.items || [];
    const videos = await Promise.all(videoItems.map(async (item: any, index: number) => {
        // Fetch real comments for this video to get a more dynamic sentiment score
        let sentimentScore = 75; // Default fallback
        try {
            const commentsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${item.id}&maxResults=15`,
                { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
            );
            const commentsData = await commentsRes.json();
            const comments = commentsData.items || [];
            
            if (comments.length > 0) {
                const positiveWords = ["great", "awesome", "love", "good", "best", "thanks", "amazing", "wow", "nice", "king", "goat", "win"];
                const negativeWords = ["bad", "worst", "hate", "terrible", "awful", "boring", "stop", "no", "fail", "lose"];
                
                let positiveCount = 0;
                comments.forEach((c: any) => {
                    const text = c.snippet.topLevelComment.snippet.textDisplay.toLowerCase();
                    if (positiveWords.some(word => text.includes(word))) positiveCount++;
                    if (negativeWords.some(word => text.includes(word))) positiveCount -= 0.5;
                });
                
                // Calculate engagement quality bonus
                const viewCount = parseInt(item.statistics.viewCount || "1");
                const likeCount = parseInt(item.statistics.likeCount || "0");
                const engagementRate = (likeCount / viewCount) * 100;
                
                // High engagement = better sentiment (up to +10 points)
                const engagementBonus = Math.min(10, engagementRate * 0.5);
                
                // Base 65% + bonus for positive comments + engagement bonus, capped at 99%
                sentimentScore = Math.min(99, Math.max(40, Math.round(65 + (positiveCount / comments.length) * 35 + engagementBonus)));
            }
        } catch (e) {
            console.error(`Error fetching comments for video ${item.id}:`, e);
            // Fallback: Use a more dynamic formula based on multiple factors
            const viewCount = parseInt(item.statistics.viewCount || "1");
            const likeCount = parseInt(item.statistics.likeCount || "0");
            const commentCount = parseInt(item.statistics.commentCount || "0");
            
            // Engagement-based score when comments API fails
            const engagementRate = (likeCount + commentCount) / viewCount;
            sentimentScore = Math.min(99, Math.max(40, Math.round(60 + (engagementRate * 100) + (commentCount % 15))));
        }

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
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
