import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface JwtPayload {
  userId: string;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    await connectDB();
    const user = await User.findById(decoded.userId.toString());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear YouTube connection data
    user.youtubeConnected = false;
    user.youtubeAccessToken = undefined;
    user.youtubeRefreshToken = undefined;
    user.youtubeChannelId = undefined;
    user.youtubeChannelTitle = undefined;
    user.youtubeChannelThumbnail = undefined;
    
    await user.save();

    return NextResponse.json({ 
      message: "YouTube channel disconnected successfully",
      youtubeConnected: false
    });

  } catch (error) {
    console.error("Disconnect YouTube error:", error);
    return NextResponse.json({ error: "Failed to disconnect YouTube" }, { status: 500 });
  }
}
