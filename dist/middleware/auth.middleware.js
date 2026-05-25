import { StatusCodes } from "http-status-codes";
import sendResponse from "../utils/response";
import { verifyToken } from "../utils/jwt";
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access");
            return;
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid or expired token");
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.middleware.js.map