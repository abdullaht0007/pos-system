import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  token: string;
}

export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username },
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      return null;
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        token,
        tokenExpiry,
      },
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      token: updatedUser.token!,
    };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    console.log("Verifying token:", token.substring(0, 10) + "...");

    const user = await prisma.user.findFirst({
      where: {
        token,
        tokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      console.log("Token verification failed: user not found or token expired");
      return null;
    }

    console.log("Token verified successfully for user:", user.username);
    return {
      id: user.id,
      username: user.username,
      token: user.token!,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function logoutUser(token: string): Promise<boolean> {
  try {
    await prisma.user.updateMany({
      where: { token },
      data: {
        token: null,
        tokenExpiry: null,
      },
    });
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function createInitialUser(): Promise<void> {
  try {
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return; // User already exists
    }

    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash,
      },
    });
    console.log("Initial user created: admin/admin123");
  } catch (error) {
    console.error("Error creating initial user:", error);
  }
}
