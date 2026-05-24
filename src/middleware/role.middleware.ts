import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "maintainer") {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Forbidden access",
    });
  }

  next();
};
