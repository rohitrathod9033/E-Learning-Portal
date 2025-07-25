import User from "../models/User.js";
import Stripe from "stripe";
import { purchaseCourse } from './userController';
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

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



const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
switch (event.type) {
  case 'payment_intent.succeeded':{
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;

    const session = await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId
    });

    const {purchaseId} = session.data[0].metadata;

    const purchaseData = await Purchase.findById(purchaseId)
    const userData = await User.findById(purchaseData.userId)

    const courseData = await Course.findById(purchaseData.courseId.toString());
    courseData.enrolledStudents.push(userData._id);
    await courseData.save();

    userData.enrolledCourses.push(courseData._id);
    await userData.save();

    purchaseData.status = 'Completed'
    await purchaseData.save()

  break;}

  case 'payment_intent.payment_failed':{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId
      });

      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId)
      purchaseData.status = 'failed'
      await purchaseData.save()

    break;}
  // ... handle other event types
  default:
    console.log(`Unhandled event type ${event.type}`);
}

};
