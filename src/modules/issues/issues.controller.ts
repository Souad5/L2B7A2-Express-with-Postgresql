import type { Request, Response, NextFunction } from "express";
import { sql } from "../../db";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, type } = req.body;
    const reporter_id = req.user?.id;

    if (!title || title.length > 150) {
      return next(new AppError(400, "Valid title is required (Max 150 chars)"));
    }
    if (!description || description.length < 20) {
      return next(
        new AppError(400, "Detailed description is required (Min 20 chars)"),
      );
    }
    if (type !== "bug" && type !== "feature_request") {
      return next(
        new AppError(400, "Type must be either 'bug' or 'feature_request'"),
      );
    }

    const result = await sql`
      INSERT INTO issues (title, description, type, status, reporter_id)
      VALUES (${title}, ${description}, ${type}, 'open', ${reporter_id})
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at;
    `;

    return sendSuccess(res, 201, "Issue created successfully", result[0]);
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sort, type, status } = req.query;

    let queryBase = `SELECT * FROM issues WHERE 1=1`;
    const params: any[] = [];

    if (type === "bug" || type === "feature_request") {
      params.push(type);
      queryBase += ` AND type = $${params.length}`;
    }
    if (
      status === "open" ||
      status === "in_progress" ||
      status === "resolved"
    ) {
      params.push(status);
      queryBase += ` AND status = $${params.length}`;
    }

    const sortOrder = sort === "oldest" ? "ASC" : "DESC";
    queryBase += ` ORDER BY created_at ${sortOrder}`;

    // Executing raw query cleanly via dynamic string setup
    const rawResult = await sql.unsafe(queryBase, params);

    // Core Fix: Standardize Neon driver result layout to guarantee an array structure
    const issues = Array.isArray(rawResult)
      ? rawResult
      : (rawResult as any).rows || [];

    if (issues.length === 0) {
      return sendSuccess(res, 200, null, []);
    }

    // Abstract out data hydration batch queries without SQL JOIN statements
    const uniqueReporterIds = Array.from(
      new Set(issues.map((issue: any) => issue.reporter_id)),
    );

    const reportersList = await sql`
      SELECT id, name, role FROM users WHERE id = ANY(${uniqueReporterIds});
    `;

    const reporterMap = reportersList.reduce((acc: any, rep: any) => {
      acc[rep.id] = rep;
      return acc;
    }, {});

    const integratedResult = issues.map((issue: any) => {
      const { reporter_id, ...issueData } = issue;
      return {
        ...issueData,
        reporter: reporterMap[reporter_id] || null,
      };
    });

    return sendSuccess(res, 200, null, integratedResult);
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const issues = await sql`SELECT * FROM issues WHERE id = ${id};`;
    if (issues.length === 0) {
      return next(new AppError(404, "Requested issue does not exist"));
    }

    const issue = issues[0];
    const users =
      await sql`SELECT id, name, role FROM users WHERE id = ${issue.reporter_id};`;

    const { reporter_id, ...issueData } = issue;
    const transformedResponse = {
      ...issueData,
      reporter: users[0] || null,
    };

    return sendSuccess(res, 200, null, transformedResponse);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const requestingUser = req.user!;

    const existingIssues = await sql`SELECT * FROM issues WHERE id = ${id};`;
    if (existingIssues.length === 0) {
      return next(new AppError(404, "Requested issue does not exist"));
    }

    const currentIssue = existingIssues[0];

    // Authorization evaluation matrix rule checklist verification
    if (requestingUser.role !== "maintainer") {
      if (currentIssue?.reporter_id !== requestingUser.id) {
        return next(
          new AppError(
            403,
            "Forbidden: You do not own this issue configuration resource",
          ),
        );
      }
      if (currentIssue?.status !== "open") {
        return next(
          new AppError(
            409,
            "Conflict: Contributors can only update open issues",
          ),
        );
      }
      if (status && status !== currentIssue.status) {
        return next(
          new AppError(
            403,
            "Forbidden: Only Maintainers can manually advance issue workflow statuses",
          ),
        );
      }
    }

    // Input sanitization filters matching core specifications requirements
    const targetTitle = title !== undefined ? title : currentIssue?.title;
    const targetDescription =
      description !== undefined ? description : currentIssue?.description;
    const targetType = type !== undefined ? type : currentIssue?.type;
    const targetStatus = status !== undefined ? status : currentIssue?.status;

    if (targetTitle.length > 150 || targetDescription.length < 20) {
      return next(new AppError(400, "Validation Constraints Failed"));
    }

    const updatedIssue = await sql`
      UPDATE issues
      SET title = ${targetTitle},
          description = ${targetDescription},
          type = ${targetType},
          status = ${targetStatus},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at;
    `;

    return sendSuccess(res, 200, "Issue updated successfully", updatedIssue[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const checkExist = await sql`SELECT id FROM issues WHERE id = ${id};`;
    if (checkExist.length === 0) {
      return next(new AppError(404, "Requested issue does not exist"));
    }

    await sql`DELETE FROM issues WHERE id = ${id};`;

    return sendSuccess(res, 200, "Issue deleted successfully");
  } catch (error) {
    next(error);
  }
};
