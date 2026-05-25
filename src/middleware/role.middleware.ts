import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../utils/response";

const roleMiddleware = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      sendResponse(res, StatusCodes.FORBIDDEN, false, "Forbidden access");

      return;
    }

    next();
  };
};

export default roleMiddleware;
