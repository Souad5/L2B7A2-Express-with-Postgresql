import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";
const globalErrorHandler = (err, req, res, next) => {
    console.error("🔥 Error:", err);
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";
    // Handle known operational errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // PostgreSQL common errors mapping
    if (err.code) {
        switch (err.code) {
            case "23505": // unique violation
                statusCode = StatusCodes.CONFLICT;
                message = "Duplicate resource found";
                break;
            case "23503": // foreign key violation
                statusCode = StatusCodes.BAD_REQUEST;
                message = "Invalid reference (foreign key violation)";
                break;
            case "23502": // not null violation
                statusCode = StatusCodes.BAD_REQUEST;
                message = "Missing required field";
                break;
        }
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = StatusCodes.UNAUTHORIZED;
        message = "Token expired";
    }
    return res.status(statusCode).json({
        success: false,
        message,
        errors: err?.message || null,
    });
};
export default globalErrorHandler;
//# sourceMappingURL=error.middleware.js.map