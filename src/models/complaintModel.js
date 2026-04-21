import pool from "../config/db.js";

export const createComplaint = async (data) => {
  const {
    user_id,
    title,
    description,
    photo_url,
    latitude,
    longitude,
    department,
    ai_confidence,
    ai_status
  } = data;

  try {
    const result = await pool.query(
      `INSERT INTO complaints 
      (user_id, title, description, photo_url, latitude, longitude, department, ai_confidence, ai_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        user_id,
        title,
        description,
        photo_url,
        latitude,
        longitude,
        department,
        ai_confidence,
        ai_status
      ]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};
export const getComplaints = async (user, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    let result;

    if (user.role === "admin") {
      result = await pool.query(
        "SELECT * FROM complaints ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [user.id, limit, offset]
      );
    }

    return result.rows;

  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

export const updateComplaintStatus = async (id, status) => {
  try {
    const result = await pool.query(
      "UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Error updating complaint:", error);
    throw error;
  }
};

export const assignComplaint = async (id, officer_id) => {
  try {
    const result = await pool.query(
      "UPDATE complaints SET assigned_to = $1 WHERE id = $2 RETURNING *",
      [officer_id, id]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Error assigning complaint:", error);
    throw error;
  }
};

export const getOfficerComplaints = async (officer_id) => {
  try {
    const result = await pool.query(
      "SELECT * FROM complaints WHERE assigned_to = $1 ORDER BY created_at DESC",
      [officer_id]
    );

    return result.rows;

  } catch (error) {
    console.error("Error fetching officer complaints:", error);
    throw error;
  }
};