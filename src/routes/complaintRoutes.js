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

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("photo"), addComplaint);
router.get("/", authMiddleware, fetchComplaints);
router.get("/officer", authMiddleware, officerMiddleware, getOfficerAssignedComplaints);
router.patch("/:id/status", authMiddleware, officerMiddleware, officerUpdateComplaint);
router.patch("/:id/assign", authMiddleware, adminMiddleware, assignComplaintToOfficer);
router.patch("/:id", authMiddleware, adminMiddleware, updateComplaint);
// Ensure 'rectificationImage' matches your frontend formData.append key
router.post(
  "/:id/officer-update", 
  authMiddleware, 
  officerMiddleware, 
  upload.single("rectificationImage"), 
  officerUpdateComplaint
);

export default router;