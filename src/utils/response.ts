import type { Response } from "express";

const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: unknown,
  errors?: unknown,
) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};

export default sendResponse;
