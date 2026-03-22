import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const addAdmin = async () => {
  try {
    await connectDB();

    const adminData = {
      name: 'Admin',
      username: 'admin',
      email: 'admin@hrms.com',
      password: 'Admin@123456',
      role: 'Admin',
      department: 'Management',
      isActive: true,
      isFirstLogin: false
    };

    // Find user by username OR email
    let user = await User.findOne({ 
      $or: [
        { username: adminData.username },
        { email: adminData.email }
      ]
    });

    if (user) {
      console.log(`✅ User found: ${user.username} (${user.email}). Updating details...`);
      user.name = adminData.name;
      user.email = adminData.email;
      user.password = adminData.password;
      user.role = adminData.role;
      user.department = adminData.department;
      user.isActive = true;
      user.isFirstLogin = false;
      await user.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      user = new User(adminData);
      await user.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n==========================================');
    console.log('         HRMS ADMIN LOGIN DETAILS        ');
    console.log('==========================================');
    console.log(`  Username : ${adminData.username}`);
    console.log(`  Email    : ${adminData.email}`);
    console.log(`  Password : ${adminData.password}`);
    console.log(`  Role     : ${adminData.role}`);
    console.log('==========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding/updating admin user:', error);
    process.exit(1);
  }
};

addAdmin();
