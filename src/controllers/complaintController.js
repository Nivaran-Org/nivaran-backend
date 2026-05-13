import {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  assignComplaint,
  getOfficerComplaints
} from "../models/complaintModel.js";
import pool from "../config/db.js";


const routeWithAI = async (title, description) => {
  try {
    const fullText = `${title || ""}. ${description || ""}`.trim();

    // If both are empty, default to Unassigned without calling AI
    if (!fullText) return { department: "Unassigned", confidence: 0, status: "Empty Text" };

    const response = await fetch("http://172.23.96.36:8000/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint: fullText }), // Must use "complaint" key for the Python API
    });

    if (!response.ok) {
      throw new Error("AI service error");
    }

    return await response.json(); 
    // Returns: { department: "...", confidence: 0.XX, status: "Auto-Routed" }
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
    const { title, description, latitude, longitude } = req.body;
    const user_id = req.user.id;

    // Handle photo URL from multer or body
    const photo_url = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : req.body.photo_url || null;

    // 1. Call the AI Routing helper
    const aiResult = await routeWithAI(title, description);

    // 2. Prepare the data object with AI results
    const complaintData = {
      user_id,
      title,
      description,
      photo_url,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      // Use the department returned by AI, or fallback to "Unassigned"
      department: aiResult.department || "Unassigned", 
      // Optional: store confidence and status for debugging
      ai_confidence: aiResult.confidence,
      ai_status: aiResult.status,
    };

    // 3. Create the complaint in the DB
    const newComplaint = await createComplaint(complaintData);

    res.status(201).json({
      success: true,
      message: "Complaint filed and auto-routed successfully",
      data: newComplaint,
    });
  } catch (error) {
    console.error("Complaint creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create complaint" 
    });
  }
};

export const fetchComplaints = async (req, res) => {
  try {
    const complaints = await getComplaints(req.user);
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateComplaintStatus(id, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const assignComplaintToOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;
    const updated = await assignComplaint(id, officer_id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Assign failed" });
  }
};

export const getOfficerAssignedComplaints = async (req, res) => {
  try {
    const complaints = await getOfficerComplaints(req.user.id);
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

export const officerUpdateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    // Check if a file was actually uploaded via Multer
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Rectification photo is required to close this complaint." 
      });
    }

    const rectifiedImageUrl = `/uploads/${req.file.filename}`;

    // THE FIX: Execute the SQL query with double-quoted case-sensitive columns
    const query = `
      UPDATE complaints 
      SET 
        status = $1, 
        "officerRemarks" = $2, 
        "rectifiedImageUrl" = $3, 
        "updatedAt" = NOW() 
      WHERE id = $4
      RETURNING *;
    `;

    const values = [status || 'resolved', remarks, rectifiedImageUrl, id];
    const result = await pool.query(query, values); // Use your DB pool here

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    console.log("Database updated successfully for ID:", id);

    res.json({ 
      success: true, 
      message: "Complaint resolved with photo proof.",
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("Officer update error:", error);
    res.status(500).json({ success: false, message: "Internal server error during update" });
  }
};