import { Router } from "express";
import { createIssue, getAllIssues } from "./issues.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createIssue);

router.get("/", getAllIssues);

export default router;
