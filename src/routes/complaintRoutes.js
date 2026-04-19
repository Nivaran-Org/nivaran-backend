import express from "express";
import { addComplaint, fetchComplaints, updateComplaint, assignComplaintToOfficer, getOfficerAssignedComplaints } from "../controllers/complaintController.js";
import { authMiddleware, adminMiddleware, officerMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create complaint (protected route)
router.post("/", authMiddleware, addComplaint);

// Get complaints
router.get("/", authMiddleware, fetchComplaints);

// Update complaint (ADMIN only)
router.put("/:id", authMiddleware, adminMiddleware, updateComplaint);

// Assign complaint to officer (ADMIN only)
router.put("/:id/assign", authMiddleware, adminMiddleware, assignComplaintToOfficer);

// Officer → get assigned complaints
router.get("/officer", authMiddleware, officerMiddleware, getOfficerAssignedComplaints);

export default router;