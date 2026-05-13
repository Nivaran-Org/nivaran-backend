import express from "express";
import { fetchUsers, createOfficerUser } from "../controllers/userController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin: get all users
router.get("/", authMiddleware, adminMiddleware, fetchUsers);

// Admin: get officers only
router.get("/officers", authMiddleware, adminMiddleware, fetchUsers); // filtered below

// Admin: create officer
router.post("/officer", authMiddleware, adminMiddleware, createOfficerUser);

export default router;