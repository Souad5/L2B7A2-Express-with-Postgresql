import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createIssueService } from "./issues.service.js";
import { db } from "../../config/db.js";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    const issue = await createIssueService(
      title,
      description,
      type,
      req.user!.id,
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Issue creation failed",
    });
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = "newest", type, status } = req.query;

    let query = "SELECT * FROM issues";
    const values: string[] = [];
    const conditions: string[] = [];

    if (type) {
      values.push(type as string);
      conditions.push(`type = $${values.length}`);
    }

    if (status) {
      values.push(status as string);
      conditions.push(`status = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query +=
      sort === "oldest"
        ? " ORDER BY created_at ASC"
        : " ORDER BY created_at DESC";

    const issuesResult = await db.query(query, values);

    const reporterIds = [
      ...new Set(issuesResult.rows.map((i) => i.reporter_id)),
    ];

    let reportersMap: Record<number, unknown> = {};

    if (reporterIds.length > 0) {
      const placeholders = reporterIds.map((_, idx) => `$${idx + 1}`).join(",");

      const reportersResult = await db.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id IN (${placeholders})
        `,
        reporterIds,
      );

      reportersMap = reportersResult.rows.reduce(
        (acc, reporter) => {
          acc[reporter.id] = reporter;
          return acc;
        },
        {} as Record<number, unknown>,
      );
    }

    const formattedIssues = issuesResult.rows.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reportersMap[issue.reporter_id as keyof typeof reportersMap],
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: formattedIssues,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};
