import pool from "../config/db.js";

export const createComplaint = async (data) => {
  const {
    user_id,
    title,
    description,
    photo_url,
    latitude,
    longitude
  } = data;

  try {
    const result = await pool.query(
      `INSERT INTO complaints 
      (user_id, title, description, photo_url, latitude, longitude) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [user_id, title, description, photo_url, latitude, longitude]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};