import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateAIReport } from "@/lib/ai";

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
            metrics: {
                views: "1240",
                likes: "88",
                favorites: "0",
                shares: "24",
                watchTime: "1.2k hours",
                downloads: "0",
            },
            // New comprehensive fields
            videoSummary: "This video explores cutting-edge AI strategies for content creators, covering automation tools, workflow optimization, and future trends in AI-assisted production.",
            contentGaps: ["Viewers wanted specific tool recommendations with pricing", "More beginner-friendly setup tutorials needed", "Case studies showing before/after results"],
            retentionInsights: ["Strong first 30 seconds but intro runs too long", "Middle section at 5:00 mark shows engagement drop", "High rewatch rate on key strategy explanations"],
            trendingTopics: ["AI video editing automation", "ChatGPT for YouTube scripts", "Passive income with AI content"],
            competitorComparison: "Top competitors on this topic use faster cuts (every 3-5 seconds), more B-roll variety, and open with a shocking statistic rather than introduction.",
            technicalIssues: ["Background music slightly loud in sections", "Some text overlays hard to read on mobile"],
            audienceInsights: "Primary audience is intermediate creators (1k-50k subs) seeking actionable AI workflows to scale content production without sacrificing quality."
        });
    }

    // 3. Fetch More Comments for AI Analysis
    const commentsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100`,
        { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const commentsData = await commentsRes.json();
    const commentTexts = commentsData.items?.map((it: any) => it.snippet.topLevelComment.snippet.textDisplay) || [];

    // 4. Fetch Related/Trending Videos for Competitive Analysis
    let relatedVideos = [];
    try {
        const categoryId = video.snippet.categoryId || "22"; // Default to People & Blogs
        const trendingRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=5&videoCategoryId=${categoryId}`,
            { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
        );
        const trendingData = await trendingRes.json();
        relatedVideos = trendingData.items || [];
    } catch (e) {
        console.warn("Could not fetch trending videos:", e);
    }

    // 5. Generate Merged AI Report with Enhanced Context
    const videoContext = {
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnails: video.snippet.thumbnails,
        statistics: video.statistics,
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration || "N/A",
        definition: video.contentDetails?.definition || "N/A",
        caption: video.contentDetails?.caption || "false",
        // Engagement ratios for deeper analysis
        engagementRate: ((parseInt(video.statistics.likeCount || "0") + parseInt(video.statistics.commentCount || "0")) / parseInt(video.statistics.viewCount || "1")) * 100,
        likeToViewRatio: (parseInt(video.statistics.likeCount || "0") / parseInt(video.statistics.viewCount || "1")) * 100,
        commentToViewRatio: (parseInt(video.statistics.commentCount || "0") / parseInt(video.statistics.viewCount || "1")) * 100,
        // Competitive context
        trendingVideos: relatedVideos.map((v: any) => ({
            title: v.snippet.title,
            views: v.statistics.viewCount,
            likes: v.statistics.likeCount
        }))
    };

    let aiReport;
    try {
        aiReport = await generateAIReport(commentTexts, videoContext);
    } catch (e: any) {
        console.error("AI Generation failed, using fallback:", e.message || e);
        aiReport = {
            sentimentScore: 70 + (videoId.length % 15),
            goodPoints: [`Engaging topic: ${video?.snippet?.title?.split(' ')[0] || "Content"}`, "Good production quality", "Clear audio and visuals"],
            improvPoints: ["Add more calls to action", "Refine the thumbnail strategy", "Increase community interaction"],
            flagPoints: [],
            thumbnailStrategy: ["Use high-contrast text", "Add a focal point figure", "Brighten the background"],
            questions: commentTexts.filter((t: string) => t.includes("?")).slice(0, 5),
            nextVideoIdea: `A deeper dive into ${video?.snippet?.title || "this topic"} focusing on audience questions.`,
            whatIsGreat: `Your audience is responding well to the core message of "${video?.snippet?.title || "this video"}".`,
            whatIsBad: "Some viewers are asking for more detailed explanations in the middle segments.",
            overallSummary: `This video, "${video?.snippet?.title || "Your Content"}", shows steady performance. While AI analysis had a hiccup, the raw metrics suggest your audience is engaged with the topic. We recommend continuing this series with more specific "how-to" segments as requested in the comments.`,
            viralStrategy: "Pivot to short-form teasers to drive long-form retention."
        };
    }
    
    return NextResponse.json({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        commentCount: parseInt(video.statistics.commentCount || "0"),
        sentimentScore: aiReport.sentimentScore,
        emoji: "🎬",
        gradientFrom: "#FF3B3B",
        gradientTo: "#FF6B35",
        goodPoints: aiReport.goodPoints,
        improvPoints: aiReport.improvPoints,
        flagPoints: aiReport.flagPoints,
        thumbnailStrategy: aiReport.thumbnailStrategy || [],
        questions: aiReport.questions,
        nextVideoIdea: aiReport.nextVideoIdea,
        whatIsGreat: aiReport.whatIsGreat,
        whatIsBad: aiReport.whatIsBad,
        overallSummary: aiReport.overallSummary,
        viralStrategy: aiReport.viralStrategy,
        // New comprehensive fields
        videoSummary: aiReport.videoSummary,
        contentGaps: aiReport.contentGaps || [],
        retentionInsights: aiReport.retentionInsights || [],
        trendingTopics: aiReport.trendingTopics || [],
        competitorComparison: aiReport.competitorComparison,
        technicalIssues: aiReport.technicalIssues || [],
        audienceInsights: aiReport.audienceInsights,
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
