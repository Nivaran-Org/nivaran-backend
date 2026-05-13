import bcrypt from "bcrypt";
import { getAllUsers, createOfficer } from "../models/userModel.js";
import pool from "../config/db.js";

export const fetchUsers = async (req, res) => {
  try {
    const { role } = req.query; // ?role=officer filters officers only
    let users;

    if (role) {
      const result = await pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE role = $1",
        [role]
      );
      users = result.rows;
    } else {
      users = await getAllUsers();
      // Remove passwords
      users = users.map(({ password, ...u }) => u);
    }

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const createOfficerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const officer = await createOfficer(name, email, hashedPassword);
    const { password: _, ...officerData } = officer;

    res.status(201).json({ success: true, message: "Officer created successfully", data: officerData });
  } catch (error) {
    console.error("Create officer error:", error);
    res.status(500).json({ success: false, message: "Failed to create officer" });
  }
};