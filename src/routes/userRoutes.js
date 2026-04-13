import express from "express";
import { fetchUsers } from "../controllers/userController.js";

const router = express.Router();

// GET all users
router.get("/users", fetchUsers);

export default router;