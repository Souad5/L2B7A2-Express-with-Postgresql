import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  name: string;
  role: string;
}

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
