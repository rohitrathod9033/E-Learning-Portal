// server.js or app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import cloudinary from './configs/cloudinary.js';

import { clerkWebhooks } from './controllers/webhooks.js';
import { clerkMiddleware } from '@clerk/express';

import userRouter from './routes/userRoutes.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';

const app = express();

// Connect DB
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send("API Running"));
app.post('/clerk', clerkWebhooks);
app.use('/api/user', userRouter);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
