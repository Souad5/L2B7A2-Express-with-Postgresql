import { StatusCodes } from "http-status-codes";
import { pool } from "../../db";
import { AppError } from "../../utils/AppError";
const createIssue = async (title, description, type, reporterId) => {
    const result = await pool.query(`
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `, [title, description, type, reporterId]);
    return result.rows[0];
};
const getAllIssues = async (sort, type, status) => {
    let query = `SELECT * FROM issues`;
    const values = [];
    const conditions = [];
    if (type) {
        values.push(type);
        conditions.push(`type = $${values.length}`);
    }
    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }
    if (conditions.length) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY created_at ${sort === "oldest" ? "ASC" : "DESC"}`;
    const issues = await pool.query(query, values);
    const reporterIds = [
        ...new Set(issues.rows.map((issue) => issue.reporter_id)),
    ];
    let reportersMap = {};
    if (reporterIds.length) {
        const placeholders = reporterIds
            .map((_, index) => `$${index + 1}`)
            .join(",");
        const users = await pool.query(`
      SELECT id, name, role
      FROM users
      WHERE id IN (${placeholders})
      `, reporterIds);
        reportersMap = users.rows.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }
    return issues.rows.map((issue) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reportersMap[issue.reporter_id],
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }));
};
const getSingleIssue = async (id) => {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
        id,
    ]);
    if (!issueResult.rows.length) {
        throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }
    const issue = issueResult.rows[0];
    const reporterResult = await pool.query(`
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `, [issue.reporter_id]);
    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterResult.rows[0],
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
};
const updateIssue = async (id, body) => {
    const existingIssue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
        id,
    ]);
    if (!existingIssue.rows.length) {
        throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }
    const issue = existingIssue.rows[0];
    const fields = [];
    const values = [];
    Object.entries(body).forEach(([key, value]) => {
        fields.push(`${key} = $${fields.length + 1}`);
        values.push(value);
    });
    values.push(id);
    const query = `
    UPDATE issues
    SET ${fields.join(", ")},
    updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `;
    const result = await pool.query(query, values);
    return {
        updatedIssue: result.rows[0],
        existingIssue: issue,
    };
};
const deleteIssue = async (id) => {
    const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
    if (!issue.rows.length) {
        throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }
    await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};
export const IssueService = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
};
//# sourceMappingURL=issue.service.js.map