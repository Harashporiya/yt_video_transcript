import express from "express";
import dotenv from "dotenv";
import youtubeRoutes from "./routes/youtube.routes.js"
import userRoutes from "./routes/user.routes.js"
dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/youtube", youtubeRoutes);


app.get("/", (req, res) => {
  res.send("Server Running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});