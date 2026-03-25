import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateVideoIdeas } from "@/lib/ai";

interface JwtPayload {
  userId: string;
}

export async function POST(request: Request) {
  try {
    const { topic, audienceInsights, contentGaps, trendingTopics, marketScenario } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Optional: Verify authentication to get user's channel data
    let userContext = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("axion_auth")?.value;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        await connectDB();
        userContext = await User.findById(decoded.userId.toString());
      }
    } catch (authError) {
      // Not authenticated - that's okay, we'll use generic data
      console.log("User not authenticated, using generic context");
    }

    // Generate AI-powered video ideas based on trends and market data
    const ideas = await generateVideoIdeas(
      topic,
      audienceInsights || undefined,
      contentGaps || undefined,
      trendingTopics || undefined,
      marketScenario || "Current YouTube landscape in 2024 favors educational content with entertainment value, short-form teasers driving long-form views, and authentic creator personalities"
    );

    return NextResponse.json({ 
      ideas,
      metadata: {
        topic,
        generatedAt: new Date().toISOString(),
        totalIdeas: ideas.length,
        avgTrendingScore: Math.round(ideas.reduce((sum, idea) => sum + idea.trendingScore, 0) / ideas.length),
        lowCompetitionCount: ideas.filter(i => i.competitionLevel === 'Low').length,
        categories: [...new Set(ideas.map(i => i.category))]
      }
    });

  } catch (error: any) {
    console.error("Idea Generation Error:", error);
    
    // If AI fails completely, return fallback ideas
    const fallbackIdeas: any[] = [
      {
        title: "Content Complete Guide 2024",
        hook: "Everything you need to know to master this skill",
        description: "Comprehensive tutorial covering this topic from basics to advanced techniques.",
        targetAudience: "All Levels",
        trendingScore: 85,
        competitionLevel: "Medium",
        estimatedDifficulty: "Easy",
        contentGapsToFill: ["Structured learning path needed"],
        keywords: ["tutorial", "guide", "2024"],
        thumbnailConcept: "Bold text with clear imagery",
        whyItWillWork: "Evergreen content with consistent search demand",
        category: "Tutorial"
      }
    ];

    return NextResponse.json({ 
      ideas: fallbackIdeas,
      metadata: {
        topic: "General",
        generatedAt: new Date().toISOString(),
        totalIdeas: fallbackIdeas.length,
        avgTrendingScore: 85,
        lowCompetitionCount: 0,
        categories: ["Tutorial"]
      },
      warning: "Using fallback ideas due to AI service unavailability"
    });
  }
}
