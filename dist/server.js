
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";

// src/utils/catchAsync.ts
var catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var catchAsync_default = catchAsync;

// src/utils/response.ts
var sendResponse = (res, statusCode, success, message, data, errors) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    errors
  });
};
var response_default = sendResponse;

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/config/index.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT || "5000",
  database: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET || "fallback_super_secret_key_123!",
  jwtExpiresIn: env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS)
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.database,
  ssl: {
    rejectUnauthorized: false
  }
});
var initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT valid_role CHECK(role IN ('contributor', 'maintainer'))
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(30) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'open',
        reporter_id INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT valid_type CHECK(type IN ('bug', 'feature_request')),
        CONSTRAINT valid_status CHECK(status IN ('open', 'in_progress', 'resolved'))
      )
    `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

// src/modules/auth/auth.service.ts
import { StatusCodes } from "http-status-codes";
var signupUser = async (name, email, password, role) => {
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (existingUser.rows.length) {
    throw new AppError("User already exists", StatusCodes.CONFLICT);
  }
  const hashedPassword = await bcrypt.hash(password, config_default.bcryptSaltRounds);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};
var loginUser = async (email, password) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email
  ]);
  if (!result.rows.length) {
    throw new Error("Invalid credentials");
  }
  const user = result.rows[0];
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new Error("Invalid credentials");
  }
  return user;
};
var AuthService = {
  signupUser,
  loginUser
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var generateToken = (payload) => {
  return jwt.sign(payload, config_default.jwtSecret, {
    expiresIn: "7d"
  });
};
var verifyToken = (token) => {
  return jwt.verify(token, config_default.jwtSecret);
};

// src/utils/validation.ts
var isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// src/modules/auth/auth.controller.ts
var signup = catchAsync_default(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    response_default(
      res,
      StatusCodes2.BAD_REQUEST,
      false,
      "All fields are required"
    );
    return;
  }
  if (!isValidEmail(email)) {
    response_default(res, StatusCodes2.BAD_REQUEST, false, "Invalid email");
    return;
  }
  const user = await AuthService.signupUser(
    name,
    email,
    password,
    role || "contributor"
  );
  response_default(
    res,
    StatusCodes2.CREATED,
    true,
    "User registered successfully",
    user
  );
});
var login = catchAsync_default(async (req, res) => {
  const { email, password } = req.body;
  const user = await AuthService.loginUser(email, password);
  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role
  });
  response_default(res, StatusCodes2.OK, true, "Login successful", {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  });
});
var AuthController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
var auth_route_default = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.controller.ts
import { StatusCodes as StatusCodes4 } from "http-status-codes";

// src/modules/issues/issue.service.ts
import { StatusCodes as StatusCodes3 } from "http-status-codes";
var createIssue = async (title, description, type, reporterId) => {
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};
var getAllIssues = async (sort, type, status) => {
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
    ...new Set(issues.rows.map((issue) => issue.reporter_id))
  ];
  let reportersMap = {};
  if (reporterIds.length) {
    const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(",");
    const users = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE id IN (${placeholders})
      `,
      reporterIds
    );
    reportersMap = users.rows.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {}
    );
  }
  return issues.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reportersMap[issue.reporter_id],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (!issueResult.rows.length) {
    throw new AppError("Issue not found", StatusCodes3.NOT_FOUND);
  }
  const issue = issueResult.rows[0];
  const reporterResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id]
  );
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssue = async (id, body) => {
  const existingIssue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (!existingIssue.rows.length) {
    throw new AppError("Issue not found", StatusCodes3.NOT_FOUND);
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
    existingIssue: issue
  };
};
var deleteIssue = async (id) => {
  const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  if (!issue.rows.length) {
    throw new AppError("Issue not found", StatusCodes3.NOT_FOUND);
  }
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};
var IssueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issue.controller.ts
var createIssue2 = catchAsync_default(async (req, res) => {
  const { title, description, type } = req.body;
  const issue = await IssueService.createIssue(
    title,
    description,
    type,
    req.user.id
  );
  response_default(
    res,
    StatusCodes4.CREATED,
    true,
    "Issue created successfully",
    issue
  );
});
var getAllIssues2 = catchAsync_default(async (req, res) => {
  const { sort = "newest", type, status } = req.query;
  const issues = await IssueService.getAllIssues(
    sort,
    type,
    status
  );
  response_default(
    res,
    StatusCodes4.OK,
    true,
    "Issues fetched successfully",
    issues
  );
});
var getSingleIssue2 = catchAsync_default(async (req, res) => {
  const issue = await IssueService.getSingleIssue(Number(req.params.id));
  response_default(res, StatusCodes4.OK, true, "Issue fetched successfully", issue);
});
var updateIssue2 = catchAsync_default(async (req, res) => {
  const issueId = Number(req.params.id);
  const result = await IssueService.updateIssue(issueId, req.body);
  const existingIssue = result.existingIssue;
  if (req.user?.role === "contributor" && existingIssue.reporter_id !== req.user.id) {
    response_default(res, StatusCodes4.FORBIDDEN, false, "Forbidden access");
    return;
  }
  if (req.user?.role === "contributor" && existingIssue.status !== "open") {
    response_default(
      res,
      StatusCodes4.CONFLICT,
      false,
      "Cannot edit non-open issue"
    );
    return;
  }
  response_default(
    res,
    StatusCodes4.OK,
    true,
    "Issue updated successfully",
    result.updatedIssue
  );
});
var deleteIssue2 = catchAsync_default(async (req, res) => {
  await IssueService.deleteIssue(Number(req.params.id));
  response_default(res, StatusCodes4.OK, true, "Issue deleted successfully");
});
var IssueController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.middleware.ts
import { StatusCodes as StatusCodes5 } from "http-status-codes";
var authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      response_default(res, StatusCodes5.UNAUTHORIZED, false, "Unauthorized access");
      return;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    response_default(
      res,
      StatusCodes5.UNAUTHORIZED,
      false,
      "Invalid or expired token"
    );
  }
};
var auth_middleware_default = authMiddleware;

// src/middleware/role.middleware.ts
import { StatusCodes as StatusCodes6 } from "http-status-codes";
var roleMiddleware = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      response_default(res, StatusCodes6.FORBIDDEN, false, "Forbidden access");
      return;
    }
    next();
  };
};
var role_middleware_default = roleMiddleware;

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_middleware_default, IssueController.createIssue);
router2.get("/", IssueController.getAllIssues);
router2.get("/:id", IssueController.getSingleIssue);
router2.patch("/:id", auth_middleware_default, IssueController.updateIssue);
router2.delete(
  "/:id",
  auth_middleware_default,
  role_middleware_default("maintainer"),
  IssueController.deleteIssue
);
var issue_route_default = router2;

// src/middleware/error.middleware.ts
import { StatusCodes as StatusCodes7 } from "http-status-codes";
var globalErrorHandler = (err, req, res, next) => {
  console.error("\u{1F525} Error:", err);
  let statusCode = StatusCodes7.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  if (err.code) {
    switch (err.code) {
      case "23505":
        statusCode = StatusCodes7.CONFLICT;
        message = "Duplicate resource found";
        break;
      case "23503":
        statusCode = StatusCodes7.BAD_REQUEST;
        message = "Invalid reference (foreign key violation)";
        break;
      case "23502":
        statusCode = StatusCodes7.BAD_REQUEST;
        message = "Missing required field";
        break;
    }
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = StatusCodes7.UNAUTHORIZED;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = StatusCodes7.UNAUTHORIZED;
    message = "Token expired";
  }
  return res.status(statusCode).json({
    success: false,
    message,
    errors: err?.message || null
  });
};
var error_middleware_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(
  cors({
    origin: "http://localhost:5000"
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("DevPulse API Running");
});
app.use("/api/auth", auth_route_default);
app.use("/api/issues", issue_route_default);
app.use(error_middleware_default);
var app_default = app;

// src/server.ts
var main = async () => {
  try {
    await initDb();
    app_default.listen(config_default.port, () => {
      console.log(`Server is running on port ${config_default.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
main();
//# sourceMappingURL=server.js.map