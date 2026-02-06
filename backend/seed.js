import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import { createOrUpdateCustomer } from "./src/utils/stripe.js";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nicegrading.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL,
      role: "admin",
    });

    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    // Create Stripe customer for admin
    const stripeCustomer = await createOrUpdateCustomer(
      ADMIN_EMAIL,
      ADMIN_NAME,
    );

    // Create admin user
    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD, // Will be hashed by pre-save middleware
      role: "admin",
      stripeCustomerId: stripeCustomer.id,
    });

    await adminUser.save();

    console.log("✓ Admin user created successfully!");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(
      "\n⚠️  IMPORTANT: Change the password immediately after first login!",
    );
    console.log("   Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
