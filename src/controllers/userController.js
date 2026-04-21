import bcrypt from "bcrypt";

import { getAllUsers, createOfficer } from "../models/userModel.js";

export const fetchUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error("Error in controller:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

export const createOfficerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const officer = await createOfficer(name, email, hashedPassword);

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: officer
    });

  } catch (error) {
    console.error("Create officer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create officer"
    });
  }
};