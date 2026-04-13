import { createComplaint } from "../models/complaintModel.js";

export const addComplaint = async (req, res) => {
  try {
    const { title, description, latitude, longitude, photo_url } = req.body;

    // get user from JWT
    const user_id = req.user.id;

    const complaintData = {
      user_id,
      title,
      description,
      photo_url,
      latitude,
      longitude
    };

    const newComplaint = await createComplaint(complaintData);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: newComplaint
    });

  } catch (error) {
    console.error("Complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create complaint"
    });
  }
};