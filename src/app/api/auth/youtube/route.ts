import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;
    
    if (!clientId) {
        return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 });
    }

    const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes.join(" "))}` +
        `&access_type=offline` +
        `&prompt=consent`;

    return NextResponse.redirect(authUrl);
}
