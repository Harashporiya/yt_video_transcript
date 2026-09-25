import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Checks the Google ID token with Google and returns the verified profile, or null if it's not valid for this app.
const verifyGoogleIdToken = async (idToken) => {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) return null;

  const payload = await response.json();
  const isValid =
    payload.aud === process.env.GOOGLE_CLIENT_ID &&
    GOOGLE_ISSUERS.includes(payload.iss) &&
    (payload.email_verified === true || payload.email_verified === "true") &&
    payload.email;

  if (!isValid) return null;
  return { email: payload.email, name: payload.name || payload.email.split("@")[0] };
};

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ message: "Google ID token is required" });
  }

  try {
    const profile = await verifyGoogleIdToken(idToken);
    if (!profile) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email, name } = profile;
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Google users sign in through Google only; this random password is never shown to anyone
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: { id: true, name: true, email: true }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2d" });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Google Auth successful", token, user: userWithoutPassword });
  } catch (error) {
    console.error("Error in google auth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !password || !email) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" })
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ message: "Please enter a valid name" })
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2d" })

    res.status(201).json({ message: "User created successfully", token, user })


  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "All fields are required" })
    }
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2d" })

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", token, user: userWithoutPassword })

  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getUserVideos = async (req, res) => {
  const userId = req.user.userId;
  try {
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        videoId: true,
        videoUrl: true,
        title: true,
        thumbnail: true,
        totalChunks: true,
        createdAt: true,
      },
    });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};