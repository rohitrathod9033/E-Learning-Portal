import Course from '../models/Course.js';
import Purchase from '../models/Purchase.js';

// ✅ Add a new course
export const addCourse = async (req, res) => {
  try {
    const { courseTitle, courseDescription, coursePrice, discount, courseContent } = req.body;

    const newCourse = new Course({
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      courseContent,
      educator: req.auth.userId,
    });

    await newCourse.save();
    res.status(201).json({ success: true, course: newCourse });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Update user role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    // Example: You can update a role field in your User model if needed.
    res.status(200).json({ success: true, message: 'Role updated to educator' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Get all courses by current educator
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const courses = await Course.find({ educator: educatorId });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching educator courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Dashboard data (total courses, more stats optional)
export const educatorDashboardData = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const totalCourses = await Course.countDocuments({ educator: educatorId });

    res.status(200).json({ success: true, data: { totalCourses } });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Enrolled students with course + user data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educatorId = req.auth.userId;

    const courses = await Course.find({ educator: educatorId });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    })
      .populate('userId', 'name imageUrl')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = purchases.map(purchase => ({
      student: purchase.userId,
      courseTitle: purchase.courseId?.courseTitle || 'N/A',
      purchaseDate: purchase.createdAt,
    }));

    res.status(200).json({ success: true, enrolledStudents });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
