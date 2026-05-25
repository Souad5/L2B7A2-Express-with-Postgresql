import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../utils/response";
import { verifyToken } from "../utils/jwt";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access");

      return;
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      false,
      "Invalid or expired token",
    );
  }
};

export default authMiddleware;
