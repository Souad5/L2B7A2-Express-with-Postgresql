import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
} from "./issues.controller";

const router = Router();

// Publicly reachable resource streams
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);

// Protected functional operations endpoints paths
router.post("/", authenticate, createIssue);
router.patch("/:id", authenticate, updateIssue);
router.delete("/:id", authenticate, authorize("maintainer"), deleteIssue);

export const issueRoutes = router;
