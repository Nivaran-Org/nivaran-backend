import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  assignComplaint,
  getOfficerComplaints
} from "../models/complaintModel.js";

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

   // 🆕 Get page & limit from query
    const { page = 1, limit = 10 } = req.query;

    // 🆕 Pass them to model
    const complaints = await getComplaints(
      user,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
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

export const getOfficerAssignedComplaints = async (req, res) => {
  try {
    const officer_id = req.user.id;

    const complaints = await getOfficerComplaints(officer_id);

    res.json({
      success: true,
      data: complaints
    });

  } catch (error) {
    console.error("Officer fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch officer complaints"
    });
  }
};

export const officerUpdateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const officer_id = req.user.id;

    // OPTIONAL: ensure officer is assigned to this complaint
    const complaints = await getOfficerComplaints(officer_id);
    const isAssigned = complaints.find(c => c.id == id);

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this complaint"
      });
    }
 
    const updatedComplaint = await updateComplaintStatus(id, status);
    
    res.json({
      success: true,
      message: "Complaint updated by officer",
      data: updatedComplaint
    });

  } catch (error) {
    console.error("Officer update error:", error);

    
    res.status(500).json({
      success: false,
      message: "Failed to update complaint"
    });
  }
};