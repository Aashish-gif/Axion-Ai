import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface JwtPayload {
  userId: string;
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId.toString());

    if (!user || !user.youtubeAccessToken) {
      return NextResponse.json({ error: "YouTube not connected" }, { status: 400 });
    }

    // If a specific videoId is provided, only fetch comments for that video
    if (videoId) {
      const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=relevance`,
        { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
      );
      const commentsData = await commentsRes.json();
      
      // Get video details
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`,
        { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
      );
      const videoData = await videoRes.json();
      const videoTitle = videoData.items?.[0]?.snippet?.title || "Unknown Video";

      if (commentsData.items) {
        const comments = commentsData.items.map((item: any) => ({
          id: item.id,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          author: item.snippet.topLevelComment.snippet.authorDisplayName,
          authorAvatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
          likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
          replyCount: item.snippet.totalReplyCount || 0,
          videoId: videoId,
          videoTitle: videoTitle
        }));

        // Sort by likeCount descending
        comments.sort((a: any, b: any) => b.likeCount - a.likeCount);

        return NextResponse.json({ 
          comments,
          channelTitle: user.youtubeChannelTitle || "Your Channel"
        });
      }
      
      return NextResponse.json({ comments: [] });
    }

    // This is a simplified version. In a real app, you'd iterate through videos.
    // Here we'll just fetch recent activity/comments for the channel.
    // Specifically, let's fetch commentThreads for the channel's uploads.
    
    // 1. Get uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
       return NextResponse.json({ comments: [] });
    }

    // 2. Get recent videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videosData = await videosRes.json();
    const videoIds = videosData.items?.map((item: any) => item.snippet.resourceId.videoId) || [];

    // 3. Get comments for these videos (with likeCount + replyCount for prioritization)
    const allComments = [];
    for (const videoId of videoIds) {
        const commentsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=relevance`,
            { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
        );
        const commentsData = await commentsRes.json();
        if (commentsData.items) {
            allComments.push(...commentsData.items.map((item: any) => ({
                id: item.id,
                text: item.snippet.topLevelComment.snippet.textDisplay,
                author: item.snippet.topLevelComment.snippet.authorDisplayName,
                authorAvatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
                publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
                likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
                replyCount: item.snippet.totalReplyCount || 0,
                videoId: videoId,
                videoTitle: videosData.items.find((v: any) => v.snippet.resourceId.videoId === videoId)?.snippet.title
            })));
        }
    }

    // Sort by likeCount descending so most-liked comments appear first
    allComments.sort((a: any, b: any) => b.likeCount - a.likeCount);

    return NextResponse.json({ 
        comments: allComments,
        channelTitle: channelData.items?.[0]?.snippet?.title || "Your Channel"
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
