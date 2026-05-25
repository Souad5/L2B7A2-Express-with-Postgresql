import bcrypt from "bcrypt";
import config from "../../config";
import { pool } from "../../db";
import { AppError } from "../../utils/AppError";
import { StatusCodes } from "http-status-codes";
const signupUser = async (name, email, password, role) => {
    const existingUser = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (existingUser.rows.length) {
        throw new AppError("User already exists", StatusCodes.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
    const result = await pool.query(`
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `, [name, email, hashedPassword, role]);
    return result.rows[0];
};
const loginUser = async (email, password) => {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
        email,
    ]);
    if (!result.rows.length) {
        throw new Error("Invalid credentials");
    }
    const user = result.rows[0];
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
        throw new Error("Invalid credentials");
    }
    return user;
};
export const AuthService = {
    signupUser,
    loginUser,
};
//# sourceMappingURL=auth.service.js.map