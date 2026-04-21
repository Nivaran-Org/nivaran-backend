import pool from "../config/db.js";

export const getAllUsers = async () => {
  try {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createOfficer = async (name, email, password) => {
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'officer') RETURNING *",
      [name, email, password]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Error creating officer:", error);
    throw error;
  }
};