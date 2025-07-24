// controllers/userController.js
import User from "../models/User.js";

// ✅ Get User Data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findOne({ id: userId }); // ⬅️ FIXED

    if (!user) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Enrolled Courses
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findOne({ id: userId }).populate('enrolledCourses'); // ⬅️ FIXED

    if (!user) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    res.json({
      success: true,
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
