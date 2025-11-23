import user from "../models/User.js";
import { Webhook } from 'svix';

export const addNewUser = async (req, res) => {
    console.log("✅ Test route hit!");

  try {
    // Get the headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing svix headers");
      return res.status(400).json({ error: "Missing svix headers" });
    }

    // Get the body as string
    const body = req.body.toString();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("❌ Webhook verification failed:", err.message);
      return res.status(400).json({ error: "Webhook verification failed" });
    }

    // Now evt is the verified payload
    const eventType = evt.type;
    const eventData = evt.data;

    const { id, first_name } = eventData;

    console.log("📩 Webhook event type:", eventType);
    console.log("📩 Webhook data:", eventData);

    if (eventType === "user.created") {
      const existingUser = await user.findOne({ clerk_id: id });

      if (existingUser) {
        console.log("⚠️ User already exists:", existingUser);
        return res.status(200).json({ message: "User already exists" });
      }

      const newUser = await user.create({
        name: first_name,
        clerk_id: id,
      });

      console.log("✅ New user created:", newUser);
      return res.status(201).json({ message: "User created", user: newUser });
    }

    console.log("ℹ️ Ignored event type:", eventType);
    res.status(200).json({ message: "Event ignored" });
    
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};