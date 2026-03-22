/**
 * Auto-Add Sundays Multi-Tenancy Test
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { autoAddSundaysForMonth, autoAddSundays } from '../controllers/holidayController.js';
import User from '../models/User.js';
import CompanyHoliday from '../models/CompanyHoliday.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'hrms';

async function test() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log('Connected to MongoDB');

    const TENANT_A = 'test-tenant-A';
    const TENANT_B = 'test-tenant-B';

    // 1. Ensure test users exist for these tenants (to be found by .distinct)
    await User.findOneAndUpdate(
      { careerLensUserId: TENANT_A },
      { name: 'HR A', role: 'HR', isActive: true },
      { upsert: true }
    );
    await User.findOneAndUpdate(
      { careerLensUserId: TENANT_B },
      { name: 'HR B', role: 'HR', isActive: true },
      { upsert: true }
    );

    // 2. Clean existing Sundays for these tenants
    await CompanyHoliday.deleteMany({
      description: 'Sunday',
      careerLensUserId: { $in: [TENANT_A, TENANT_B, null] }
    });

    console.log('\n--- Testing Manual Trigger (Tenant A only) ---');
    const manualResult = await autoAddSundaysForMonth(true, { name: 'Tester', _id: new mongoose.Types.ObjectId() }, TENANT_A);
    console.log('Manual Result:', manualResult);

    const countA = await CompanyHoliday.countDocuments({ careerLensUserId: TENANT_A, description: 'Sunday' });
    const countB = await CompanyHoliday.countDocuments({ careerLensUserId: TENANT_B, description: 'Sunday' });

    console.log(`Tenant A Sundays: ${countA}`);
    console.log(`Tenant B Sundays: ${countB}`);

    if (countA > 0 && countB === 0) {
      console.log('✅ Manual trigger correctly scoped to Tenant A');
    } else {
      console.log('❌ Manual trigger failed scoping');
    }

    console.log('\n--- Testing Global Trigger (All Tenants) ---');
    // Calling without tenantId should pick up A and B
    const globalResult = await autoAddSundaysForMonth(true);
    console.log('Global Result:', globalResult);

    const finalCountA = await CompanyHoliday.countDocuments({ careerLensUserId: TENANT_A, description: 'Sunday' });
    const finalCountB = await CompanyHoliday.countDocuments({ careerLensUserId: TENANT_B, description: 'Sunday' });
    const finalCountNull = await CompanyHoliday.countDocuments({ careerLensUserId: null, description: 'Sunday' });

    console.log(`Tenant A Sundays: ${finalCountA}`);
    console.log(`Tenant B Sundays: ${finalCountB}`);
    console.log(`Default (null) Sundays: ${finalCountNull}`);

    if (finalCountA > 0 && finalCountB > 0 && finalCountNull > 0) {
      console.log('✅ Global trigger correctly added Sundays for all tenants');
    } else {
      console.log('❌ Global trigger failed to add Sundays for all tenants');
    }

    // Cleanup
    await User.deleteMany({ careerLensUserId: { $in: [TENANT_A, TENANT_B] } });
    await CompanyHoliday.deleteMany({
      description: 'Sunday',
      careerLensUserId: { $in: [TENANT_A, TENANT_B, null] }
    });

    console.log('\nTests completed.');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
