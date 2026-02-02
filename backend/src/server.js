import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.get("/", (req, res) => {
  res.send("Hello From the server,");
});
app.use("/api/users", userRoutes);
app.use("/api/postRoutes", postRoutes);
app.use("/api/comments", commentRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: err.message || "Internal server Error " });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("Server is running on port", ENV.PORT),
    );
  } catch (error) {
    console.error("Failed to start the server", error.message);
    process.exit(1);
  }
};
startServer();
