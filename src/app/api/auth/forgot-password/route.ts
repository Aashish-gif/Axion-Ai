import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        message: "If an account exists with that email, you will receive a password reset link shortly." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save hashed token to user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Axionix AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - Axionix AI",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FF3B3B, #FF6B35); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 3px solid #111827; }
              .button { display: inline-block; background: #FF3B3B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; border: 3px solid #111827; box-shadow: 4px 4px 0 #111827; margin: 20px 0; }
              .button:hover { background: #DC2626; }
              .footer { background: #111827; color: white; padding: 20px; text-align: center; border-radius: 0 0 16px 16px; margin-top: 20px; }
              .warning { background: #FEF2F2; border: 2px solid #FCA5A5; padding: 15px; border-radius: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
              </div>
              
              <div class="content">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.name || 'there'},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  You requested to reset your password for your <strong>Axionix AI</strong> account.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </p>

                <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #FF3B3B; word-break: break-all;">${resetUrl}</a>
                </p>

                <div class="warning">
                  <p style="margin: 0; font-size: 14px; color: #B91C1C;">
                    <strong>⚠️ Important:</strong> This link expires in <strong>1 hour</strong> for your security.
                  </p>
                </div>

                <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">
                  If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>

              <div class="footer">
                <p style="margin: 0; font-size: 14px;">
                  © ${new Date().getFullYear()} Axionix AI. All rights reserved.
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #9CA3AF;">
                  Empowering creators with AI-driven insights
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Password Reset Request - Axionix AI

        Hi,

        You requested to reset your password for your Axionix AI account.

        Click the link below to reset your password:
        ${resetUrl}

        This link expires in 1 hour.

        If you didn't request this password reset, you can safely ignore this email.

        © ${new Date().getFullYear()} Axionix AI. All rights reserved.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: "If an account exists with that email, you will receive a password reset link shortly." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
