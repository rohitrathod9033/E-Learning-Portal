import express from "express";
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Route to update role to Educator
educatorRouter.get("/update-role", updateRoleToEducator);

// Route to add a new course (POST /api/educator/courses)
educatorRouter.post("/courses", upload.single("image"), protectEducator, addCourse);

educatorRouter.get("/courses", protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", protectEducator, getEnrolledStudentsData);

export default educatorRouter;
