import express from "express";
import {
  addComplaint,
  fetchComplaints,
  updateComplaint,
  assignComplaintToOfficer,
  getOfficerAssignedComplaints,
  officerUpdateComplaint,
} from "../controllers/complaintController.js";
import { authMiddleware, adminMiddleware, officerMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// User: file a complaint (with optional image)
router.post("/", authMiddleware, upload.single("photo"), addComplaint);

// User/Admin: get complaints (model handles role filtering)
router.get("/", authMiddleware, fetchComplaints);

// Officer: get assigned complaints
router.get("/officer", authMiddleware, officerMiddleware, getOfficerAssignedComplaints);

// Officer: update complaint status
router.patch("/:id/status", authMiddleware, officerMiddleware, officerUpdateComplaint);

// Admin: assign complaint to officer
router.patch("/:id/assign", authMiddleware, adminMiddleware, assignComplaintToOfficer);

// Admin: update any complaint status
router.patch("/:id", authMiddleware, adminMiddleware, updateComplaint);

export default router;