import { StatusCodes } from "http-status-codes";
import sendResponse from "../utils/response";
const roleMiddleware = (role) => {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            sendResponse(res, StatusCodes.FORBIDDEN, false, "Forbidden access");
            return;
        }
        next();
    };
};
export default roleMiddleware;
//# sourceMappingURL=role.middleware.js.map