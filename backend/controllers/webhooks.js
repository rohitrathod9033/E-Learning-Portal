// controllers/webhooks.js
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  const { type, data } = req.body;

  try {
    if (type === "user.created") {
      const user = data;

      await User.create({
        _id: user.id, // Clerk user ID
        name: `${user.first_name} ${user.last_name}`,
        email: user.email_addresses[0].email_address,
        imageUrl: user.image_url,
      });

      return res.status(201).json({ success: true, message: "User created in DB" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


