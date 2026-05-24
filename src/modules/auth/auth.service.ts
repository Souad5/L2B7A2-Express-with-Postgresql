import bcrypt from "bcrypt";
import { db } from "../../config/db.js";

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
) => {
  const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS),
  );

  const result = await db.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );

  return result.rows[0];
};
