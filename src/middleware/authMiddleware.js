import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    success: false,
    message: "No token provided"
  });
}

const token = authHeader.split(" ")[1];

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // attach user data to request
  req.user = decoded;

  next(); // move to controller

} catch (error) {
  return res.status(401).json({
    success: false,
    message: "Invalid or expired token"
  });
}
};

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Access denied: Admins only"
  });
}

next();

};

export const officerMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "officer") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Officers only"
      });
    }

    next();

  } catch (error) {
    console.error("Officer middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};