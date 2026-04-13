import express from "express";
import { addComplaint } from "../controllers/complaintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create complaint (protected route)
router.post("/", authMiddleware, addComplaint);

export default router;