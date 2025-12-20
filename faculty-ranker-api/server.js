// server.js
import { config } from 'dotenv';
import express, { json } from 'express';
import mongoose, { mongo } from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import facultyRoutes from "./routes/faculty.js";
import commentRoutes from "./routes/comments.js";
import reportRoutes from './routes/report.js'
import adminRoutes from './routes/admin.js'

import { User } from './models/User.js'
import Professor from './models/Professor.js';
import { Rating } from './models/Rating.js';
import { Comment } from './models/Comment.js';
import { Report } from './models/Report.js'


config();
const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

const isDev = true;

const COLLECTIONS = [
  User,
  Professor,
  Comment,
  Rating,
  Report
];

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://vitap-faculty-ranker.online",
  "https://www.vitap-faculty-ranker.online"
];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["https://accounts.google.com"],
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { ok: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  message: { ok: false, message: 'Too many authentication attempts' },
});

app.use(json({ limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, reportRoutes);
app.use('/api', apiLimiter, commentRoutes);
app.use('/api', apiLimiter, protectedRoutes);
app.use("/api", apiLimiter, facultyRoutes);
app.use("/api", apiLimiter, adminRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    ok: false,
    message
  });
});

const requiredEnvVars = ['MONGO_URI', 'GOOGLE_CLIENT_ID', 'EMAIL_SALT'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`ERROR: ${varName} is missing in environment variables`);
    process.exit(1);
  }
}

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'vitap-faculty-ranker',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('MongoDB connected successfully');
    mongoose.connection.createCollections(COLLECTIONS).then(() => {
      console.log('Collections verified');
    }).catch(err => {
      console.error('Error creating collections:', err);
    });

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});