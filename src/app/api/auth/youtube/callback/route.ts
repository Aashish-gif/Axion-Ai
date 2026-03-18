import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface JwtPayload {
  userId: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=no_code", request.url));
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(new URL("/dashboard?error=token_exchange", request.url));
    }

    // Get Channel Info
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
       return NextResponse.redirect(new URL("/dashboard?error=no_channel", request.url));
    }

    await connectDB();
    await User.findByIdAndUpdate(decoded.userId, {
      youtubeConnected: true,
      youtubeAccessToken: tokens.access_token,
      youtubeRefreshToken: tokens.refresh_token,
      youtubeChannelId: channel.id,
      youtubeChannelTitle: channel.snippet.title,
      youtubeChannelThumbnail: channel.snippet.thumbnails.default.url,
    });

    return NextResponse.redirect(new URL("/dashboard?success=youtube_connected", request.url));
  } catch (error) {
    console.error("YouTube callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_failed", request.url));
  }
}
