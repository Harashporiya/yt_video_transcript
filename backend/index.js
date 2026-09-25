import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import youtubeRoutes from "./routes/youtube.routes.js"
import userRoutes from "./routes/user.routes.js"
import paymentRoutes from "./routes/payment.routes.js"

const app = express();

const allowedOrigins = [
  process.env.LOCAL_FRONTEND_URL,
  process.env.FRONTEND_DEPLOY_URL,
]

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Number of proxies in front of the app (Render/Railway: 1). Only trust X-Forwarded-For when a proxy
// actually sets it; otherwise clients could spoof it to dodge rate limiting.
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? (process.env.NODE_ENV === "production" ? 1 : 0)));

app.use(helmet());
app.use(cors(corsOptions));

const limiterOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
};

// Slows down password guessing. /google is left out: it is called from the Next.js server, so every user shares one IP.
const authLimiter = rateLimit({ ...limiterOptions, windowMs: 15 * 60 * 1000, limit: 20 });

// Caps how fast one client can spend LLM, embedding and transcript credits
const aiLimiter = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 20 });

app.use(["/api/users/login", "/api/users/signup"], authLimiter);
app.use("/api/youtube", aiLimiter);

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
// Express 5 leaves req.body undefined when a request has no JSON body; controllers destructure it
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/payment", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Catches anything a route didn't handle, e.g. malformed JSON bodies, without leaking internals
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("[Unhandled]", err);
  res.status(status).json({
    success: false,
    message: status < 500 ? err.message : "Internal server error",
  });
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});