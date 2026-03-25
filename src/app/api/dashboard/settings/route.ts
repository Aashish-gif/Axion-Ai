import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    const user = await User.findById(decoded.userId.toString());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user settings
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        youtubeConnected: user.youtubeConnected,
        youtubeChannelId: user.youtubeChannelId,
        youtubeChannelTitle: user.youtubeChannelTitle,
        youtubeChannelThumbnail: user.youtubeChannelThumbnail,
        // Notification preferences (add these fields to User model later)
        emailNotifications: true,
        weeklyDigest: true,
        negativeSentimentAlerts: false,
      },
      // Mock usage data - you can track this in DB later
      usage: {
        reportsGenerated: 12,
        reportsLimit: 20,
        plan: "Pro",
        planStatus: "Active",
        price: "$19/month",
        nextBilling: "Oct 12, 2024",
      }
    });

  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axion_auth")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const body = await request.json();

    await connectDB();
    const user = await User.findById(decoded.userId.toString());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update notification preferences
    if (body.emailNotifications !== undefined) {
      user.set("emailNotifications", body.emailNotifications);
    }
    if (body.weeklyDigest !== undefined) {
      user.set("weeklyDigest", body.weeklyDigest);
    }
    if (body.negativeSentimentAlerts !== undefined) {
      user.set("negativeSentimentAlerts", body.negativeSentimentAlerts);
    }

    await user.save();

    return NextResponse.json({ 
      message: "Settings updated successfully",
      settings: {
        emailNotifications: user.emailNotifications,
        weeklyDigest: user.weeklyDigest,
        negativeSentimentAlerts: user.negativeSentimentAlerts,
      }
    });

  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
