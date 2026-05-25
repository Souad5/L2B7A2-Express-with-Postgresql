import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { globalErrorHandler } from "./middleware/error.middleware";
import { authRoutes } from "./modules/auth/auth.route";
import { issueRoutes } from "./modules/issues/issues.route";

const app: Application = express();

// Standard parsers
app.use(express.json());

// Mapping endpoint configurations explicitly
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("DevPulse Internal Engine Live.");
});

// Post processing Global Exception Middleware Layer
app.use(globalErrorHandler);

export default app;
