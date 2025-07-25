import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

// Get User Data
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

// Get Enrolled Courses
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

// Purchase Course "Payment Authentication"
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: 'Data Not Found' });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId, 
      amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
    }

    const newPurchase = await Purchase.create(purchaseData)

    // Stripe Gateway Initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    const currency = process.env.CURRENCY.toLowerCase()

    const line_items = [
      {
        price_data: {
          currency: "INR", // or your dynamic currency variable 
          product_data: {
            name: courseData.courseTitle
          },
          unit_amount: Math.floor(newPurchase.amount) * 100, // amount in paisa if INR
        },
        quantity: 1
      }
    ];
    
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`, // fixed missing backtick and slash
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString()
      }
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};