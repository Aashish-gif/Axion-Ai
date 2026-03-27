import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  youtubeConnected: boolean;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeChannelId?: string;
  youtubeChannelTitle?: string;
  youtubeChannelThumbnail?: string;
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Notification preferences
  emailNotifications?: boolean;
  weeklyDigest?: boolean;
  negativeSentimentAlerts?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Cached report interface
export interface ICachedReport extends Document {
  userId: string;
  videoId: string;
  reportData: any;
  videoStatistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  expiresAt: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for Google Auth users
    minlength: [6, "Password must be at least 6 characters"],
  },
  youtubeConnected: {
    type: Boolean,
    default: false,
  },
  youtubeAccessToken: String,
  youtubeRefreshToken: String,
  youtubeChannelId: String,
  youtubeChannelTitle: String,
  youtubeChannelThumbnail: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailNotifications: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: true },
  negativeSentimentAlerts: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Cached Report Schema
const CachedReportSchema = new Schema<ICachedReport>({
  userId: { type: String, required: true, index: true },
  videoId: { type: String, required: true, index: true },
  reportData: { type: Object, required: true },
  videoStatistics: {
    viewCount: Number,
    likeCount: Number,
    commentCount: Number,
  },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Clean up old model in development to ensure schema changes are applied
if (process.env.NODE_ENV === "development" && mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
const CachedReport = mongoose.models.CachedReport || mongoose.model<ICachedReport>("CachedReport", CachedReportSchema);

export default User;
export { CachedReport };
