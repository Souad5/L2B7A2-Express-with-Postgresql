import dotenv from "dotenv";
import { env } from "node:process";
dotenv.config({ quiet: true });
const config = {
    port: (env.PORT || "5000"),
    database: env.DATABASE_URL,
    jwtSecret: (env.JWT_SECRET || "fallback_super_secret_key_123!"),
    jwtExpiresIn: (env.JWT_EXPIRES_IN || "1d"),
    bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS),
};
export default config;
//# sourceMappingURL=index.js.map