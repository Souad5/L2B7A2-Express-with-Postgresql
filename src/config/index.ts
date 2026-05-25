import dotenv from "dotenv";
import { env } from "node:process";

dotenv.config({ quiet: true });

const config = {
  port: (env.PORT || "5000") as string,
  database: env.DATABASE_URL as string,
  jwtSecret: (env.JWT_SECRET || "fallback_super_secret_key_123!") as string,
  jwtExpiresIn: (env.JWT_EXPIRES_IN || "1d") as string,
  bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS),
};

export default config;
