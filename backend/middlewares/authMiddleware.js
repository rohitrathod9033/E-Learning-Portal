import { clerkClient } from '@clerk/express';

// Middleware to protect educator routes
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.role !== 'educator') {
      return res.json({
        success: false,
        message: 'Unauthorized Access: Educator role required',
      });
    }

    next(); // Allow access
  } catch (error) {
    res.json({success: false, message: error.message})
  }
};

