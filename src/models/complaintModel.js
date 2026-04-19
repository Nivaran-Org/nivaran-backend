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
export const getComplaints = async (user) => {
  try {
    let result;

    // If admin → get all complaints
    if (user.role === "admin") {
      result = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    } 
    // If normal user → get only their complaints
    else {
      result = await pool.query(
        "SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC",
        [user.id]
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