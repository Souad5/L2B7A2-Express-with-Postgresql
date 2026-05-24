import dotenv from "dotenv";
import { env } from "node:process";

dotenv.config();

const config = {
  port: env.PORT,
  database: env.DATABASE_URL,
};

export default config;
