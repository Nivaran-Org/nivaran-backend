import { getAllUsers } from "../models/userModel.js";

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