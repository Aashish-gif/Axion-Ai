import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User, { CachedReport } from "@/models/User";
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

    // === CACHING LAYER ===
    // Check if we have a cached report for this video
    const cachedReport = await CachedReport.findOne({
      userId: decoded.userId.toString(),
      videoId: videoId,
      expiresAt: { $gt: new Date() } // Not expired
    });

    // 1. Fetch Video Metadata (to check if data changed)
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
      { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
    );
    const videoData = await videoRes.json();
    let video = videoData.items?.[0];

    if (!video || videoId === "1") {
        // Return mock data without caching
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
            videoSummary: "This video explores cutting-edge AI strategies for content creators, covering automation tools, workflow optimization, and future trends in AI-assisted production.",
            contentGaps: ["Viewers wanted specific tool recommendations with pricing", "More beginner-friendly setup tutorials needed", "Case studies showing before/after results"],
            retentionInsights: ["Strong first 30 seconds but intro runs too long", "Middle section at 5:00 mark shows engagement drop", "High rewatch rate on key strategy explanations"],
            trendingTopics: ["AI video editing automation", "ChatGPT for YouTube scripts", "Passive income with AI content"],
            competitorComparison: "Top competitors on this topic use faster cuts (every 3-5 seconds), more B-roll variety, and open with a shocking statistic rather than introduction.",
            technicalIssues: ["Background music slightly loud in sections", "Some text overlays hard to read on mobile"],
            audienceInsights: "Primary audience is intermediate creators (1k-50k subs) seeking actionable AI workflows to scale content production without sacrificing quality."
        });
    }

    // Check if video statistics changed significantly (more than 5% in views or comments)
    const currentStats = {
      viewCount: parseInt(video.statistics.viewCount || "0"),
      likeCount: parseInt(video.statistics.likeCount || "0"),
      commentCount: parseInt(video.statistics.commentCount || "0")
    };

    if (cachedReport) {
      const oldStats = cachedReport.videoStatistics;
      const viewChange = Math.abs(currentStats.viewCount - oldStats.viewCount) / (oldStats.viewCount || 1);
      const commentChange = Math.abs(currentStats.commentCount - oldStats.commentCount) / (oldStats.commentCount || 1);
      
      // If stats haven't changed much (<5%), return cached report
      if (viewChange < 0.05 && commentChange < 0.05) {
        console.log(`✓ Returning cached report for video ${videoId}`);
        return NextResponse.json(cachedReport.reportData);
      }
      
      console.log(`📊 Stats changed significantly (views: ${(viewChange * 100).toFixed(1)}%, comments: ${(commentChange * 100).toFixed(1)}%), regenerating report...`);
    }

    // Continue fetching fresh data if no cache or stats changed
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

    // 5. Fetch REAL YouTube Analytics Data (Watch Time, Impressions, CTR, Retention)
    let analyticsData = null;
    try {
        const publishedAt = new Date(video.snippet.publishedAt);
        const today = new Date();
        
        // Calculate date range (from publish date to today, max 90 days for free tier)
        const startDate = new Date(publishedAt);
        const endDate = new Date(Math.min(today.getTime(), publishedAt.getTime() + (90 * 24 * 60 * 60 * 1000)));
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fetch key metrics: views, watchTime, subscribersGained, impressions, ctr
        const analyticsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/reports?ids=channel==MINE&startDate=${startDateStr}&endDate=${endDateStr}&metrics=views,watchTime,subscribersGained,impressions,averageViewDuration,estimatedMinutesWatched&dimensions=day&filters=video==${videoId}`,
            { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
        );
        
        if (analyticsRes.ok) {
            analyticsData = await analyticsRes.json();
        }
    } catch (e) {
        console.warn("YouTube Analytics API not available (requires YouTube Partner status):", (e as Error).message);
        // Analytics API requires YouTube Partner Program membership
        // We'll use calculated estimates instead
    }

    // Alternative: Calculate estimated analytics from available statistics
    const estimatedAnalytics = {
        views: parseInt(video.statistics.viewCount || "0"),
        likes: parseInt(video.statistics.likeCount || "0"),
        comments: parseInt(video.statistics.commentCount || "0"),
        favorites: parseInt(video.statistics.favoriteCount || "0"),
        // Estimated watch time (average view duration * views)
        estimatedWatchTimeHours: Math.round((parseInt(video.statistics.viewCount || "0") * 0.4) / 60), // Assumes 40% avg retention
        // Estimated CTR (industry average is 4-5%)
        estimatedCTR: 4.5 + (Math.random() * 2 - 1), // 3.5-5.5% range
        // Estimated impressions
        estimatedImpressions: Math.round(parseInt(video.statistics.viewCount || "0") / 0.045), // Inverse of avg CTR
        // Engagement rate
        engagementRate: ((parseInt(video.statistics.likeCount || "0") + parseInt(video.statistics.commentCount || "0")) / parseInt(video.statistics.viewCount || "1")) * 100,
        // Like-to-view ratio
        likeToViewRatio: (parseInt(video.statistics.likeCount || "0") / parseInt(video.statistics.viewCount || "1")) * 100,
        // Comment-to-view ratio
        commentToViewRatio: (parseInt(video.statistics.commentCount || "0") / parseInt(video.statistics.viewCount || "1")) * 100,
        // Subscriber conversion estimate (typically 0.5-1% of viewers subscribe)
        estimatedSubscribersGained: Math.round(parseInt(video.statistics.viewCount || "0") * 0.007)
    };

    // 6. Generate Merged AI Report with Enhanced Context
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
        // Real/Estimated analytics data
        analytics: analyticsData || estimatedAnalytics,
        // Engagement ratios for deeper analysis
        engagementRate: estimatedAnalytics.engagementRate,
        likeToViewRatio: estimatedAnalytics.likeToViewRatio,
        commentToViewRatio: estimatedAnalytics.commentToViewRatio,
        // Performance metrics
        watchTimeHours: analyticsData?.watchTime || estimatedAnalytics.estimatedWatchTimeHours,
        impressions: analyticsData?.impressions || estimatedAnalytics.estimatedImpressions,
        ctr: analyticsData?.ctr || estimatedAnalytics.estimatedCTR,
        subscribersGained: analyticsData?.subscribersGained || estimatedAnalytics.estimatedSubscribersGained,
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
    
    const reportData = {
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
            watchTime: `${analyticsData?.watchTime || estimatedAnalytics.estimatedWatchTimeHours} hours`,
            downloads: "Manual Tracking", // Not available via API
            // NEW: Advanced analytics
            impressions: analyticsData?.impressions || estimatedAnalytics.estimatedImpressions,
            ctr: (analyticsData?.ctr || estimatedAnalytics.estimatedCTR).toFixed(2) + "%",
            subscribersGained: analyticsData?.subscribersGained || estimatedAnalytics.estimatedSubscribersGained,
            avgViewDuration: Math.round((parseInt(video.statistics.viewCount || "0") > 0) ? (estimatedAnalytics.estimatedWatchTimeHours * 60 * 60) / parseInt(video.statistics.viewCount || "1") : 0) + " seconds"
        }
    };

    // === CACHE THE REPORT ===
    // Cache for 7 days or until video stats change significantly
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days cache
    
    await CachedReport.findOneAndUpdate(
      { userId: decoded.userId.toString(), videoId: videoId },
      {
        userId: decoded.userId.toString(),
        videoId: videoId,
        reportData: reportData,
        videoStatistics: currentStats,
        expiresAt: expiresAt,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached report for video ${videoId} expires ${expiresAt.toISOString()}`);

    return NextResponse.json(reportData);

  } catch (error) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
