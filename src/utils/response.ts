import { type Response } from "express";

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string | null,
  data?: any,
) => {
  const responsePayload: any = { success: true };
  if (message !== null) responsePayload.message = message;
  responsePayload.data = data;
  return res.status(statusCode).json(responsePayload);
};
