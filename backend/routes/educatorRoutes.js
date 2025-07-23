import express from 'express';
import { addCourse, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator);
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse);

export default educatorRouter;


// {
//   "courseTitle": "Test Course Title",
//   "courseDescription": "Test Course Description",
//   "coursePrice": 50,
//   "discount": 10,
//   "courseContent": [
//     {
//       "chapterId": "ch01",
//       "chapterOrder": 1,
//       "chapterTitle": "Test Chapter Title",
//       "chapterContent": [
//         {
//           "lectureId": "lec01",
//           "lectureTitle": "Test Lecture Title",
//           "lectureDuration": 20,
//           "lectureUrl": "https://example.com/lectures/lec01.mp4",
//           "isPreviewFree": true,
//           "lectureOrder": 1
//         }
//       ]
//     }
//   ]
// }




