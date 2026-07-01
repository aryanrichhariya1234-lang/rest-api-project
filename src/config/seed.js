import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import connectDB from './db.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

async function seed() {
  await connectDB();
  try {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (!existing) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin',
      });
      console.log('✅ Seeded admin user: admin@example.com / Admin@1234');
    } else {
      console.log('ℹ️  Admin user already exists, skipping.');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
