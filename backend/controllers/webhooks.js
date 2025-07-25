import Stripe from "stripe";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Clerk Webhook (unchanged)
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

// Stripe Webhook (corrected version)
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      try {
        const session = event.data.object;
        const { purchaseId } = session.metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) return res.status(404).send("Purchase not found");

        const userData = await User.findOne({ id: purchaseData.userId });
        const courseData = await Course.findById(purchaseData.courseId.toString());

        if (!userData || !courseData) return res.status(404).send("User or Course not found");

        // Enroll student
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();

        userData.enrolledCourses.push(courseData._id);
        await userData.save();

        // ✅ Mark purchase as completed
        purchaseData.status = "completed";
        await purchaseData.save();

        return res.status(200).send("Checkout session processed");
      } catch (err) {
        console.error("Error in checkout.session.completed:", err.message);
        return res.status(500).send("Internal Server Error");
      }
    }

    case 'payment_intent.payment_failed': {
      try {
        const paymentIntent = event.data.object;
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id
        });

        const session = sessionList.data[0];
        const { purchaseId } = session.metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = "failed";
          await purchaseData.save();
        }

        return res.status(200).send("Payment failed handled");
      } catch (err) {
        console.error("Error in payment_intent.payment_failed:", err.message);
        return res.status(500).send("Internal Server Error");
      }
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      return res.status(200).send("Unhandled event");
  }
};
