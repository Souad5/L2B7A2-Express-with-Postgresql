import express, {} from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.route";
import issueRoutes from "./modules/issues/issue.route";
import globalErrorHandler from "./middleware/error.middleware";
const app = express();
app.use(cors({
    origin: "http://localhost:5000",
}));
app.use(express.json());
app.get("/", (req, res) => {
    res.send("DevPulse API Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map