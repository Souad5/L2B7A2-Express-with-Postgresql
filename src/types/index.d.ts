import { Request } from "express";

export interface JWTPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
