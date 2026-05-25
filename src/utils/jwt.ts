import jwt from "jsonwebtoken";
import config from "../config";
import type { IJwtPayload } from "../interfaces/auth.interface";

export const generateToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as IJwtPayload;
};
