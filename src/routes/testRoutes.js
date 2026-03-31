import express from "express";
import { testAPI } from "../controllers/testController.js";

const router = express.Router();

// Test API route
router.get("/test", testAPI);

export default router;