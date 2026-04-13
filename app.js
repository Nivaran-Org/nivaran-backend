import testRoutes from "./src/routes/testRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", testRoutes);
app.use("/api", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

export default app;