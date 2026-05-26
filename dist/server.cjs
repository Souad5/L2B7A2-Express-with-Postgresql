
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/modules/auth/auth.controller.ts
var import_http_status_codes2 = require("http-status-codes");

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
var import_bcrypt = __toESM(require("bcrypt"), 1);

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_node_process = require("process");
import_dotenv.default.config({ quiet: true });
var config = {
  port: import_node_process.env.PORT || "5000",
  database: import_node_process.env.DATABASE_URL,
  jwtSecret: import_node_process.env.JWT_SECRET || "fallback_super_secret_key_123!",
  jwtExpiresIn: import_node_process.env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: Number(import_node_process.env.BCRYPT_SALT_ROUNDS)
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
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
var import_http_status_codes = require("http-status-codes");
var signupUser = async (name, email, password, role) => {
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (existingUser.rows.length) {
    throw new AppError("User already exists", import_http_status_codes.StatusCodes.CONFLICT);
  }
  const hashedPassword = await import_bcrypt.default.hash(password, config_default.bcryptSaltRounds);
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
  const matched = await import_bcrypt.default.compare(password, user.password);
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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var generateToken = (payload) => {
  return import_jsonwebtoken.default.sign(payload, config_default.jwtSecret, {
    expiresIn: "7d"
  });
};
var verifyToken = (token) => {
  return import_jsonwebtoken.default.verify(token, config_default.jwtSecret);
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
      import_http_status_codes2.StatusCodes.BAD_REQUEST,
      false,
      "All fields are required"
    );
    return;
  }
  if (!isValidEmail(email)) {
    response_default(res, import_http_status_codes2.StatusCodes.BAD_REQUEST, false, "Invalid email");
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
    import_http_status_codes2.StatusCodes.CREATED,
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
  response_default(res, import_http_status_codes2.StatusCodes.OK, true, "Login successful", {
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
var router = (0, import_express.Router)();
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
var auth_route_default = router;

// src/modules/issues/issue.route.ts
var import_express2 = require("express");

// src/modules/issues/issue.controller.ts
var import_http_status_codes4 = require("http-status-codes");

// src/modules/issues/issue.service.ts
var import_http_status_codes3 = require("http-status-codes");
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
    throw new AppError("Issue not found", import_http_status_codes3.StatusCodes.NOT_FOUND);
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
    throw new AppError("Issue not found", import_http_status_codes3.StatusCodes.NOT_FOUND);
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
    throw new AppError("Issue not found", import_http_status_codes3.StatusCodes.NOT_FOUND);
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
    import_http_status_codes4.StatusCodes.CREATED,
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
    import_http_status_codes4.StatusCodes.OK,
    true,
    "Issues fetched successfully",
    issues
  );
});
var getSingleIssue2 = catchAsync_default(async (req, res) => {
  const issue = await IssueService.getSingleIssue(Number(req.params.id));
  response_default(res, import_http_status_codes4.StatusCodes.OK, true, "Issue fetched successfully", issue);
});
var updateIssue2 = catchAsync_default(async (req, res) => {
  const issueId = Number(req.params.id);
  const result = await IssueService.updateIssue(issueId, req.body);
  const existingIssue = result.existingIssue;
  if (req.user?.role === "contributor" && existingIssue.reporter_id !== req.user.id) {
    response_default(res, import_http_status_codes4.StatusCodes.FORBIDDEN, false, "Forbidden access");
    return;
  }
  if (req.user?.role === "contributor" && existingIssue.status !== "open") {
    response_default(
      res,
      import_http_status_codes4.StatusCodes.CONFLICT,
      false,
      "Cannot edit non-open issue"
    );
    return;
  }
  response_default(
    res,
    import_http_status_codes4.StatusCodes.OK,
    true,
    "Issue updated successfully",
    result.updatedIssue
  );
});
var deleteIssue2 = catchAsync_default(async (req, res) => {
  await IssueService.deleteIssue(Number(req.params.id));
  response_default(res, import_http_status_codes4.StatusCodes.OK, true, "Issue deleted successfully");
});
var IssueController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.middleware.ts
var import_http_status_codes5 = require("http-status-codes");
var authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      response_default(res, import_http_status_codes5.StatusCodes.UNAUTHORIZED, false, "Unauthorized access");
      return;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    response_default(
      res,
      import_http_status_codes5.StatusCodes.UNAUTHORIZED,
      false,
      "Invalid or expired token"
    );
  }
};
var auth_middleware_default = authMiddleware;

// src/middleware/role.middleware.ts
var import_http_status_codes6 = require("http-status-codes");
var roleMiddleware = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      response_default(res, import_http_status_codes6.StatusCodes.FORBIDDEN, false, "Forbidden access");
      return;
    }
    next();
  };
};
var role_middleware_default = roleMiddleware;

// src/modules/issues/issue.route.ts
var router2 = (0, import_express2.Router)();
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
var import_http_status_codes7 = require("http-status-codes");
var globalErrorHandler = (err, req, res, next) => {
  console.error("\u{1F525} Error:", err);
  let statusCode = import_http_status_codes7.StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  if (err.code) {
    switch (err.code) {
      case "23505":
        statusCode = import_http_status_codes7.StatusCodes.CONFLICT;
        message = "Duplicate resource found";
        break;
      case "23503":
        statusCode = import_http_status_codes7.StatusCodes.BAD_REQUEST;
        message = "Invalid reference (foreign key violation)";
        break;
      case "23502":
        statusCode = import_http_status_codes7.StatusCodes.BAD_REQUEST;
        message = "Missing required field";
        break;
    }
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = import_http_status_codes7.StatusCodes.UNAUTHORIZED;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = import_http_status_codes7.StatusCodes.UNAUTHORIZED;
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
var app = (0, import_express3.default)();
app.use(
  (0, import_cors.default)({
    origin: "http://localhost:5000"
  })
);
app.use(import_express3.default.json());
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
//# sourceMappingURL=server.cjs.map