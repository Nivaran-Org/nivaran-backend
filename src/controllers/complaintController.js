import { createComplaint, getComplaints } from "../models/complaintModel.js";
import { routeComplaint } from "../services/aiService.js";

export const addComplaint = async (req, res) => {
  try {
    const { title, description, latitude, longitude, photo_url } = req.body;

    // get user from JWT
    const user_id = req.user.id;

    // Ask the nivaran-ai service which department should handle this complaint.
    // If the AI service is unreachable or errors out, we still create the
    // complaint without AI fields so citizen submissions are never blocked.
    const routing = await routeComplaint({ title, description });

    const complaintData = {
      user_id,
      title,
      description,
      photo_url,
      latitude,
      longitude,
      ai_suggested_dept: routing?.department ?? null,
      ai_confidence_score: routing?.confidence ?? null
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



export const fetchComplaints = async (req, res) => {
  try {
    const user = req.user;

    const complaints = await getComplaints(user);

    res.json({
      success: true,
      data: complaints
    });

  } catch (error) {
    console.error("Fetch complaints error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints"
    });
  }
};
