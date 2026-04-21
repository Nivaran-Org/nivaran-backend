import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { fetchUsers, createOfficerUser } from "../controllers/userController.js";

const router = express.Router();

// GET all users (ADMIN ONLY)
router.get("/", authMiddleware, adminMiddleware, fetchUsers);


// CREATE officer (admin only)
router.post("/create-officer", authMiddleware, adminMiddleware, createOfficerUser);

export default router;