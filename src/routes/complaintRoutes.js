import express from "express";
import { addComplaint, fetchComplaints } from "../controllers/complaintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create complaint (protected route)
router.post("/", authMiddleware, addComplaint);

// Get complaints
router.get("/", authMiddleware, fetchComplaints);

export default router;