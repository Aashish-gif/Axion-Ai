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
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
