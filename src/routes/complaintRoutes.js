import express from "express";
import {
  addComplaint,
  fetchComplaints,
  updateComplaint,
  assignComplaintToOfficer,
  getOfficerAssignedComplaints,
  officerUpdateComplaint
} from "../controllers/complaintController.js";
import {
  authMiddleware,
  adminMiddleware,
  officerMiddleware
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Citizen routes
router.post("/", authMiddleware, addComplaint);
router.get("/", authMiddleware, fetchComplaints);

// Admin routes
router.patch("/:id/status", authMiddleware, adminMiddleware, updateComplaint);
router.patch("/:id/assign", authMiddleware, adminMiddleware, assignComplaintToOfficer);

// Officer routes
router.get("/officer/assigned", authMiddleware, officerMiddleware, getOfficerAssignedComplaints);
router.patch("/officer/:id/status", authMiddleware, officerMiddleware, officerUpdateComplaint);

export default router;