import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import personnelRoutes from "./src/routes/personnelRoutes.js";
import skillRoutes from "./src/routes/skillRoutes.js";

import matchingRoutes from "./src/routes/matchingRoutes.js";
import personnelSkillRoutes from "./src/routes/personnelSkillRoutes.js";

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});
app.use(limiter);

// --- Disable caching globally to fix 304 responses ---
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Routes
app.use("/api/personnel", personnelRoutes);
app.use("/api/skills", skillRoutes);

app.use("/api/match", matchingRoutes);
app.use("/api/personnel-skills", personnelSkillRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "SkillMatch Backend API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  const errorResponse = {
    error: "Server Error",
    message: process.env.NODE_ENV === 'development' ? message : "Something went wrong",
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
});

// Server Startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ============================================
  🚀  SkillMatch Backend Server Started
  ============================================
  🔗  URL: http://localhost:${PORT}
  📊  Environment: ${process.env.NODE_ENV || 'development'}
  ⏰  Time: ${new Date().toISOString()}
  ============================================
  
  📍 Available Endpoints:
  - Health Check: GET /api/health
  - Personnel:    /api/personnel
  - Skills:       /api/skills
  - Projects:     /api/projects
  - Matching:     /api/match
  ============================================
  `);
});

export default app;
