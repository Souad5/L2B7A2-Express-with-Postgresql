import { neon } from "@neondatabase/serverless";
import config from "../config";

if (!config.database) {
  console.error(
    "CRITICAL: DATABASE_URL is not defined in environment variables.",
  );
  process.exit(1);
}

// Global serverless SQL client executing independent query calls natively
export const sql = neon(config.database);

export const initDb = async () => {
  try {
    // 1. Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 2. Create Issues table (Notice: No hard foreign key constraints strictly enforced via SQL JOINs as requested)
    await sql`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database connection/initialization failed:", error);
    process.exit(1);
  }
};
