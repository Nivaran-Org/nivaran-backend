import express from "express";
import { addComplaint, fetchComplaints, updateComplaint } from "../controllers/complaintController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create complaint (protected route)
router.post("/", authMiddleware, addComplaint);

// Get complaints
router.get("/", authMiddleware, fetchComplaints);

// Update complaint (ADMIN only)
router.put("/:id", authMiddleware, adminMiddleware, updateComplaint);

export default router;