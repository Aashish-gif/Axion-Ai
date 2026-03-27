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
        message: "Please log in to access your profile"
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

    // Fetch channel data if YouTube is connected
    let channelData = null;
    if (user.youtubeAccessToken) {
      try {
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true`,
          { headers: { Authorization: `Bearer ${user.youtubeAccessToken}` } }
        );
        
        if (channelRes.ok) {
          const data = await channelRes.json();
          if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            channelData = {
              id: channel.id,
              title: channel.snippet.title,
              description: channel.snippet.description,
              thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
              publishedAt: channel.snippet.publishedAt,
              subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
              videoCount: parseInt(channel.statistics.videoCount || "0"),
              viewCount: parseInt(channel.statistics.viewCount || "0"),
              uploadsPlaylistId: channel.contentDetails.relatedPlaylists?.uploads
            };
          }
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        // Continue without channel data
      }
    }

    // Calculate account stats
    const accountAge = new Date(user.createdAt || Date.now());
    const daysSinceCreation = Math.floor((Date.now() - accountAge.getTime()) / (1000 * 60 * 60 * 24));

    const profileData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || user.createdAt
      },
      channels: {
        youtube: user.youtubeAccessToken ? {
          connected: true,
          channelTitle: user.youtubeChannelTitle,
          channelData: channelData,
          connectedAt: user.createdAt // Using createdAt as proxy since we don't have connectedAt field
        } : {
          connected: false,
          channelTitle: null,
          channelData: null,
          connectedAt: null
        }
        // Add other platforms here in the future
      },
      stats: {
        accountAgeDays: daysSinceCreation,
        totalConnectedChannels: user.youtubeAccessToken ? 1 : 0,
        lastActive: user.lastLogin || user.createdAt
      }
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    if (!token) {
      return NextResponse.json({ 
        error: "Not authenticated",
        message: "Please log in to access your profile"
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

    // Disconnect YouTube channel
    user.youtubeAccessToken = null;
    user.youtubeChannelTitle = null;
    user.youtubeChannelId = null;
    user.youtubeChannelThumbnail = null;
    user.youtubeRefreshToken = null;
    user.youtubeConnected = false;
    
    await user.save();

    return NextResponse.json({ 
      message: "YouTube channel disconnected successfully",
      channels: {
        youtube: {
          connected: false,
          channelTitle: null,
          channelData: null,
          connectedAt: null
        }
      }
    });
  } catch (error) {
    console.error("Channel disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect channel" }, { status: 500 });
  }
}
