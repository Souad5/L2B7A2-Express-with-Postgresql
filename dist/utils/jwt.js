import jwt from "jsonwebtoken";
import config from "../config";
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: "7d",
    });
};
export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};
//# sourceMappingURL=jwt.js.map