import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql } from "../../db";
import config from "../../config";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    // Strict Validation Validation
    if (!name || !email || !password) {
      return next(
        new AppError(400, "Missing required registration parameters"),
      );
    }

    const assignedRole = role || "contributor";
    if (assignedRole !== "contributor" && assignedRole !== "maintainer") {
      return next(new AppError(400, "Invalid assignment role type specified"));
    }

    // Check duplicate resource
    const existingUsers =
      await sql`SELECT id FROM users WHERE email = ${email};`;
    if (existingUsers.length > 0) {
      return next(new AppError(400, "Account with this email already exists"));
    }

    // Secure encryption round
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${assignedRole})
      RETURNING id, name, email, role, created_at, updated_at;
    `;

    return sendSuccess(res, 201, "User registered successfully", result[0]);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, "Email and password are required"));
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email};`;
    if (users.length === 0) {
      return next(new AppError(401, "Invalid email or password credentials"));
    }

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user?.password);
    if (!isPasswordMatch) {
      return next(new AppError(401, "Invalid email or password credentials"));
    }

    // Inject exact requested fields to token payload per hints
    const tokenPayload = {
      id: user?.id,
      name: user?.name,
      role: user?.role,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        created_at: user?.created_at,
        updated_at: user?.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
