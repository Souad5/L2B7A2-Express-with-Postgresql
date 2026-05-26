import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/response";
import { AuthService } from "./auth.service";
import { generateToken } from "../../utils/jwt";
import { isValidEmail } from "../../utils/validation";
const signup = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        sendResponse(res, StatusCodes.BAD_REQUEST, false, "All fields are required");
        return;
    }
    if (!isValidEmail(email)) {
        sendResponse(res, StatusCodes.BAD_REQUEST, false, "Invalid email");
        return;
    }
    const user = await AuthService.signupUser(name, email, password, role || "contributor");
    sendResponse(res, StatusCodes.CREATED, true, "User registered successfully", user);
});
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);
    const token = generateToken({
        id: user.id,
        name: user.name,
        role: user.role,
    });
    sendResponse(res, StatusCodes.OK, true, "Login successful", {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        },
    });
});
export const AuthController = {
    signup,
    login,
};
//# sourceMappingURL=auth.controller.js.map