import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/response";
import { IssueService } from "./issue.service";

const createIssue = catchAsync(async (req: Request, res: Response) => {
  const { title, description, type } = req.body;

  const issue = await IssueService.createIssue(
    title,
    description,
    type,
    req.user!.id,
  );

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    "Issue created successfully",
    issue,
  );
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const { sort = "newest", type, status } = req.query;

  const issues = await IssueService.getAllIssues(
    sort as string,
    type as string,
    status as string,
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Issues fetched successfully",
    issues,
  );
});

const getSingleIssue = catchAsync(async (req: Request, res: Response) => {
  const issue = await IssueService.getSingleIssue(Number(req.params.id));

  sendResponse(res, StatusCodes.OK, true, "Issue fetched successfully", issue);
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const issueId = Number(req.params.id);

  const result = await IssueService.updateIssue(issueId, req.body);

  const existingIssue = result.existingIssue;

  if (
    req.user?.role === "contributor" &&
    existingIssue.reporter_id !== req.user.id
  ) {
    sendResponse(res, StatusCodes.FORBIDDEN, false, "Forbidden access");
    return;
  }

  if (req.user?.role === "contributor" && existingIssue.status !== "open") {
    sendResponse(
      res,
      StatusCodes.CONFLICT,
      false,
      "Cannot edit non-open issue",
    );
    return;
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Issue updated successfully",
    result.updatedIssue,
  );
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  await IssueService.deleteIssue(Number(req.params.id));

  sendResponse(res, StatusCodes.OK, true, "Issue deleted successfully");
});

export const IssueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
