import "dotenv/config";
import express from "express";
import cors from "cors";
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

app.use(cors(corsOptions));
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/payment", paymentRoutes);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});