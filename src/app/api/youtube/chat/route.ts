import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { askGeminiAboutVideo } from "@/lib/ai";

interface JwtPayload {
  userId: string;
}

export async function POST(request: Request) {
  try {
    const { videoId, query, videoContext } = await request.json();

    if (!videoId || !query) {
      return NextResponse.json({ error: "Missing videoId or query" }, { status: 400 });
    }

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

    // Call Gemini with the context
    // In a real scenario, we might want to fetch/refresh context here
    // but for now we accept it from the frontend or just the video metadata
    const answer = await askGeminiAboutVideo(query, videoContext);

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
