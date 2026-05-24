import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import youtubeRoutes from "./routes/youtube.routes.js"
import userRoutes from "./routes/user.routes.js"
dotenv.config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET","POST","DELETE","PUT","PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});