import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { fetchUsers } from "../controllers/userController.js";

const router = express.Router();

// GET all users (ADMIN ONLY)
router.get("/", authMiddleware, adminMiddleware, fetchUsers);

export default router;