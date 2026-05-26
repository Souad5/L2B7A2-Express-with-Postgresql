import { Router } from "express";
import { IssueController } from "./issue.controller";
import authMiddleware from "../../middleware/auth.middleware";
import roleMiddleware from "../../middleware/role.middleware";
const router = Router();
router.post("/", authMiddleware, IssueController.createIssue);
router.get("/", IssueController.getAllIssues);
router.get("/:id", IssueController.getSingleIssue);
router.patch("/:id", authMiddleware, IssueController.updateIssue);
router.delete("/:id", authMiddleware, roleMiddleware("maintainer"), IssueController.deleteIssue);
export default router;
//# sourceMappingURL=issue.route.js.map