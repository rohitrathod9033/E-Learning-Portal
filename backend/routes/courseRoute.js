// routes/courseRoutes.js
import express from 'express';
import { getAllCourse, getCourseById } from '../controllers/courseController.js';

const router = express.Router();

// GET /courses/all
router.get('/all', getAllCourse);

// GET /courses/:id
router.get('/:id', getCourseById);

export default router;
