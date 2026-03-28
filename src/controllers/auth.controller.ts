import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import cloudinary from "../config/cloudinary";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendEmail from "../utils/sendEmail"; // you create this function
import Otp from "../models/Otp";
import { OAuth2Client } from "google-auth-library";

/* -------------------------- GENERATE ACCESS TOKEN ------------------------- */
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

/* -------------------------- REFRESH TOKEN GENERATION ---------------------- */
const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "30d",
  });
};

/* --------------------------------- SIGNUP --------------------------------- */
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    let avatar = "";
    const userExist = await User.findOne({email: email})
    if(userExist){
      res.status(400).json({error: "User Already Exists"})
    }
    // Upload image to Cloudinary
   
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/users",
      });
      avatar = uploaded.secure_url;
    }
    // Hash password

    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      avatar,
    });
    return res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    console.log("error",err)
    return res.status(500).json({ error: err });
  }
};

/* ---------------------------------- LOGIN --------------------------------- */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    const refresh = generateRefreshToken(user._id);

    return res.json({
      success: true,
      token,
      refreshToken: refresh,
      user,
    });
  } catch (e) {
    console.log("e",e)
    return res.status(500).json({ error: e });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account found with that email" });

    // Generate 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP in DB (expires in 5 minutes)
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Email OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.log("error is==>",error)
    res.status(500).json({ message: "Server error" });
  }
};

// Verify otp

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });

    if (!record)
      return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const user: any = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete OTP after successful reset
    await Otp.deleteMany({ email });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* ------------------------------ REFRESH TOKEN ----------------------------- */
export const refreshToken = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token missing" });

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    );

    const newAccessToken = generateToken(decoded.id);

    return res.json({ token: newAccessToken });
  } catch (e) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

/* --------------------------------- PROFILE -------------------------------- */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    return res.json(user);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------ UPDATE PROFILE ---------------------------- */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    const updateData: any = {};

    // Only update fields if user sent them
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // If avatar was uploaded
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/users",
      });

      updateData.avatar = uploaded.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


/* ----------------------------- CHANGE PASSWORD ---------------------------- */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user: any = await User.findById(req.userId);

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------- LOGOUT -------------------------------- */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // Logout functionality - clear tokens on client side
    // Server doesn't maintain session state, so just return success
    // Client should delete tokens from localStorage/sessionStorage
    return res.json({ 
      success: true,
      message: "Logged out successfully. Please clear your tokens on the client." 
    });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

/* ------------------------------ DELETE ACCOUNT ---------------------------- */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------- SEARCH USERS ------------------------------- */
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const rawQuery = req.query.query;
    let q = "";

    if (typeof rawQuery === "string") {
      q = rawQuery;
    } else if (Array.isArray(rawQuery) && typeof rawQuery[0] === "string") {
      q = rawQuery[0];
    }

    if (!q) return res.json([]);

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.userId },
    }).select("name email avatar");

    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------ GET ALL USERS ----------------------------- */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("name email avatar");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------ VERIFY EMAIL ------------------------------ */
export const verifyEmail = async (req: Request, res: Response) => {
  return res.json({ message: "Verification email sent (dummy endpoint)" });
};

/* ----------------------------- GOOGLE SIGN-IN ----------------------------- */
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    console.log("req.body==>",req.body)

    if (!token) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // Initialize Google OAuth2 Client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const { email, name, picture } = payload;

    // Check if user exists
    let user: any = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        password: "", // No password for OAuth users
      });
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return res.status(500).json({ message: "Google sign-in failed" });
  }
};
