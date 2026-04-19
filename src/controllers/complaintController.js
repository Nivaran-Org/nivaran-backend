import { createComplaint, getComplaints, updateComplaintStatus, assignComplaint } from "../models/complaintModel.js";
// import { getComplaints } from "../models/complaintModel.js";
const routeWithAI = async (description) => {
  try {
    const response = await fetch("http://localhost:8000/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ complaint: description }),
    });

    if (!response.ok) throw new Error("AI service error");

    return await response.json();
  } catch (err) {
    console.warn("AI routing failed:", err.message);

    return {
      department: "Unassigned",
      confidence: 0,
      status: "AI Unavailable",
    };
  }
};

export const addComplaint = async (req, res) => {
  try {
    const { title, description, latitude, longitude, photo_url } = req.body;

    const user_id = req.user.id;

    // 🤖 Call AI
    const aiResult = await routeWithAI(description);

    const complaintData = {
      user_id,
      title,
      description,
      photo_url,
      latitude,
      longitude,

      // AI fields
      department: aiResult.department,
      ai_confidence: aiResult.confidence,
      ai_status: aiResult.status,
    };

    const newComplaint = await createComplaint(complaintData);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: newComplaint,
    });

  } catch (error) {
    console.error("Complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create complaint",
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


export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComplaint = await updateComplaintStatus(id, status);

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: updatedComplaint
    });

  } catch (error) {
    console.error("Update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update complaint"
    });
  }
};

export const assignComplaintToOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    if (!officer_id) {
      return res.status(400).json({
        success: false,
        message: "Officer ID is required"
      });
    }

    const updatedComplaint = await assignComplaint(id, officer_id);

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.json({
      success: true,
      message: "Complaint assigned to officer successfully",
      data: updatedComplaint
    });

  } catch (error) {
    console.error("Assign error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign complaint"
    });
  }
};