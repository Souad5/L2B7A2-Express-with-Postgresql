import { db } from "../../config/db.js";

export const createIssueService = async (
  title: string,
  description: string,
  type: string,
  reporterId: number,
) => {
  const result = await db.query(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, reporterId],
  );

  return result.rows[0];
};
