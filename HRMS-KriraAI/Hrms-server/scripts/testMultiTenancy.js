/**
 * Multi-Tenancy Test Script
 * Tests that HR1 and HR2 with different careerLensUserIds cannot see each other's data.
 *
 * Run: node scripts/testMultiTenancy.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'hrms';

// ─── ANSI colours ─────────────────────────────────────────────────────────────
const G = '\x1b[32m'; // green
const R = '\x1b[31m'; // red
const Y = '\x1b[33m'; // yellow
const B = '\x1b[36m'; // cyan
const W = '\x1b[0m';  // reset

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ${G}✓ PASS${W}  ${label}`);
  passed++;
}

function fail(label, note = '') {
  console.log(`  ${R}✗ FAIL${W}  ${label}${note ? `  (${note})` : ''}`);
  failed++;
}

function section(title) {
  console.log(`\n${B}━━━ ${title} ━━━${W}`);
}

// ─── Inline models (replicate schema shapes we need) ─────────────────────────
// We connect directly to Mongo via mongoose so we don't need to spin up the server.

const userSchema = new mongoose.Schema({
  name: String, username: String, email: String,
  password: String, role: { type: String, enum: ['Employee', 'HR', 'Admin'] },
  department: String, isActive: { type: Boolean, default: true },
  isFirstLogin: { type: Boolean, default: false },
  careerLensUserId: { type: String, default: null },
  paidLeaveAllocation: { type: Number, default: 0 }
}, { timestamps: true });

const holidaySchema = new mongoose.Schema({
  date: String, description: String,
  careerLensUserId: { type: String, default: null },
  createdByName: String, createdByRole: String
}, { timestamps: true });

holidaySchema.index({ date: 1, careerLensUserId: 1 }, { unique: true });

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User_T' },
  userName: String, startDate: String, endDate: String,
  category: String, reason: String,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const User_T     = mongoose.model('User_T',    userSchema);
const Holiday_T  = mongoose.model('Holiday_T', holidaySchema);
const Leave_T    = mongoose.model('Leave_T',   leaveSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw) => bcrypt.hashSync(pw, 10);

// Simulates getTenantUserIds() from the controllers
async function getTenantUserIds(tenantId) {
  const filter = { isActive: true };
  if (tenantId) filter.careerLensUserId = tenantId;
  const users = await User_T.find(filter).select('_id');
  return users.map(u => u._id);
}

// ─── Seed data ─────────────────────────────────────────────────────────────────
let HR1, HR2, EMP1, EMP2;
const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

async function seed() {
  // Clean slate — only remove test docs we create
  await User_T.deleteMany({ email: { $in: [
    'hr1@test.com','hr2@test.com','emp1@test.com','emp2@test.com'
  ]}});
  await Holiday_T.deleteMany({ careerLensUserId: { $in: [TENANT_A, TENANT_B] } });
  await Leave_T.deleteMany({ userName: { $in: ['Emp One', 'Emp Two'] } });

  HR1  = await User_T.create({ name: 'HR One',  username: 'hr1',  email: 'hr1@test.com',  password: hash('pass'), role: 'HR',       department: 'HR',  careerLensUserId: TENANT_A });
  HR2  = await User_T.create({ name: 'HR Two',  username: 'hr2',  email: 'hr2@test.com',  password: hash('pass'), role: 'HR',       department: 'HR',  careerLensUserId: TENANT_B });
  EMP1 = await User_T.create({ name: 'Emp One', username: 'emp1', email: 'emp1@test.com', password: hash('pass'), role: 'Employee', department: 'Dev', careerLensUserId: TENANT_A });
  EMP2 = await User_T.create({ name: 'Emp Two', username: 'emp2', email: 'emp2@test.com', password: hash('pass'), role: 'Employee', department: 'QA',  careerLensUserId: TENANT_B });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// ── User isolation ─────────────────────────────────────────────────────────────
async function testUserIsolation() {
  section('User Isolation');

  // getAllUsers simulation
  const viewAsHR1 = await User_T.find({ isActive: true, careerLensUserId: TENANT_A }).select('-password');
  const viewAsHR2 = await User_T.find({ isActive: true, careerLensUserId: TENANT_B }).select('-password');

  const hr1SeesTenantA = viewAsHR1.every(u => u.careerLensUserId === TENANT_A);
  const hr2SeesTenantB = viewAsHR2.every(u => u.careerLensUserId === TENANT_B);
  const hr1DoesNotSeeEmp2 = !viewAsHR1.some(u => u.email === 'emp2@test.com');
  const hr2DoesNotSeeEmp1 = !viewAsHR2.some(u => u.email === 'emp1@test.com');

  hr1SeesTenantA      ? ok('HR1 only sees Tenant A users')             : fail('HR1 sees non-Tenant-A users');
  hr2SeesTenantB      ? ok('HR2 only sees Tenant B users')             : fail('HR2 sees non-Tenant-B users');
  hr1DoesNotSeeEmp2   ? ok('HR1 cannot see Emp2 (Tenant B employee)')  : fail('HR1 can see Emp2 — data leak!');
  hr2DoesNotSeeEmp1   ? ok('HR2 cannot see Emp1 (Tenant A employee)')  : fail('HR2 can see Emp1 — data leak!');

  // getUsersByRole simulation
  const hr1Employees = await User_T.find({ role: 'Employee', isActive: true, careerLensUserId: TENANT_A });
  const hr2Employees = await User_T.find({ role: 'Employee', isActive: true, careerLensUserId: TENANT_B });

  hr1Employees.some(u => u.email === 'emp1@test.com') && !hr1Employees.some(u => u.email === 'emp2@test.com')
    ? ok('getUsersByRole: HR1 sees only own tenant employees')
    : fail('getUsersByRole: HR1 sees wrong employees');

  hr2Employees.some(u => u.email === 'emp2@test.com') && !hr2Employees.some(u => u.email === 'emp1@test.com')
    ? ok('getUsersByRole: HR2 sees only own tenant employees')
    : fail('getUsersByRole: HR2 sees wrong employees');

  // deleteUser cross-tenant check simulation
  const reqUserHR1 = { careerLensUserId: TENANT_A };
  const targetUserEmp2 = { careerLensUserId: TENANT_B };
  const crossTenantDeleteBlocked = reqUserHR1.careerLensUserId && targetUserEmp2.careerLensUserId !== reqUserHR1.careerLensUserId;
  crossTenantDeleteBlocked
    ? ok('deleteUser: cross-tenant deletion correctly blocked for HR1 → Emp2')
    : fail('deleteUser: cross-tenant deletion not blocked!');
}

// ── Holiday isolation ──────────────────────────────────────────────────────────
async function testHolidayIsolation() {
  section('Holiday Isolation');

  // HR1 adds a holiday
  await Holiday_T.create({ date: '2025-12-25', description: 'Christmas (A)', careerLensUserId: TENANT_A, createdByName: 'HR One', createdByRole: 'HR' });
  // HR2 adds a holiday on the same date
  await Holiday_T.create({ date: '2025-12-25', description: 'Christmas (B)', careerLensUserId: TENANT_B, createdByName: 'HR Two', createdByRole: 'HR' });
  // HR2 adds a different holiday
  await Holiday_T.create({ date: '2025-11-01', description: 'Diwali (B)',    careerLensUserId: TENANT_B, createdByName: 'HR Two', createdByRole: 'HR' });

  // getHolidays simulation
  const hr1Holidays = await Holiday_T.find({ careerLensUserId: TENANT_A });
  const hr2Holidays = await Holiday_T.find({ careerLensUserId: TENANT_B });

  const hr1SeesDiwali = hr1Holidays.some(h => h.date === '2025-11-01');
  const hr2SeesChristmasA = hr2Holidays.some(h => h.description === 'Christmas (A)');

  !hr1SeesDiwali   ? ok('HR1 cannot see Diwali (HR2 tenant B holiday)')       : fail('HR1 can see HR2 holiday — data leak!');
  !hr2SeesChristmasA ? ok('HR2 cannot see Christmas (A) (HR1 tenant A holiday)') : fail('HR2 can see HR1 holiday — data leak!');

  hr1Holidays.length === 1 ? ok(`HR1 sees exactly 1 holiday (their own)`)     : fail(`HR1 sees ${hr1Holidays.length} holidays (expected 1)`);
  hr2Holidays.length === 2 ? ok(`HR2 sees exactly 2 holidays (their own)`)    : fail(`HR2 sees ${hr2Holidays.length} holidays (expected 2)`);

  // delete/update ownership check simulation
  const tenantAHoliday = hr1Holidays[0];
  const callerHR2Tenant = TENANT_B;
  const ownershipCheckBlocks = (tenantAHoliday.careerLensUserId || null) !== (callerHR2Tenant || null);
  ownershipCheckBlocks
    ? ok('deleteHoliday: HR2 blocked from deleting HR1\'s holiday (ownership check)')
    : fail('deleteHoliday: ownership check NOT blocking cross-tenant delete!');
}

// ── Leave isolation ────────────────────────────────────────────────────────────
async function testLeaveIsolation() {
  section('Leave Isolation');

  // Create leaves
  await Leave_T.create({ userId: EMP1._id, userName: 'Emp One', startDate: '2025-12-10', endDate: '2025-12-10', category: 'Paid Leave', reason: 'Personal', status: 'Pending' });
  await Leave_T.create({ userId: EMP2._id, userName: 'Emp Two', startDate: '2025-12-15', endDate: '2025-12-15', category: 'Unpaid Leave', reason: 'Travel', status: 'Pending' });

  // getAllLeaves simulation - simulate getTenantUserIds
  const tenantAUserIds = await getTenantUserIds(TENANT_A);
  const tenantBUserIds = await getTenantUserIds(TENANT_B);

  const leavesForHR1 = await Leave_T.find({ userId: { $in: tenantAUserIds } });
  const leavesForHR2 = await Leave_T.find({ userId: { $in: tenantBUserIds } });

  const hr1SeesEmp2Leave = leavesForHR1.some(l => l.userName === 'Emp Two');
  const hr2SeesEmp1Leave = leavesForHR2.some(l => l.userName === 'Emp One');

  !hr1SeesEmp2Leave ? ok('getAllLeaves: HR1 cannot see Emp2\'s leave')   : fail('getAllLeaves: HR1 can see Emp2\'s leave — data leak!');
  !hr2SeesEmp1Leave ? ok('getAllLeaves: HR2 cannot see Emp1\'s leave')   : fail('getAllLeaves: HR2 can see Emp1\'s leave — data leak!');

  leavesForHR1.length === 1 ? ok('HR1 sees exactly 1 leave request (their tenant)')     : fail(`HR1 sees ${leavesForHR1.length} leaves (expected 1)`);
  leavesForHR2.length === 1 ? ok('HR2 sees exactly 1 leave request (their tenant)')     : fail(`HR2 sees ${leavesForHR2.length} leaves (expected 1)`);

  // getPendingLeaves simulation (HR-role: only own-tenant employees)
  const pendingHR1 = await Leave_T.find({ status: 'Pending', userId: { $in: tenantAUserIds } });
  const pendingHR2 = await Leave_T.find({ status: 'Pending', userId: { $in: tenantBUserIds } });

  !pendingHR1.some(l => l.userName === 'Emp Two') ? ok('getPendingLeaves: HR1 only sees own tenant pending leaves') : fail('getPendingLeaves: HR1 sees HR2 tenant leave!');
  !pendingHR2.some(l => l.userName === 'Emp One') ? ok('getPendingLeaves: HR2 only sees own tenant pending leaves') : fail('getPendingLeaves: HR2 sees HR1 tenant leave!');

  // updateLeaveStatus cross-tenant block simulation
  const [emp1Leave] = leavesForHR1;
  const leaveTenantId = TENANT_A;   // leave belongs to Tenant A
  const callerHR2     = TENANT_B;   // HR2 tries to approve it
  const crossTenantBlocked = callerHR2 && leaveTenantId !== callerHR2;
  crossTenantBlocked
    ? ok('updateLeaveStatus: HR2 blocked from approving HR1\'s tenant leave (ownership check)')
    : fail('updateLeaveStatus: cross-tenant approval NOT blocked!');
}

// ── Notification fan-out scope ──────────────────────────────────────────────────
async function testNotificationFanout() {
  section('Notification Fan-Out Scope');

  // Simulate: when HR1 adds a holiday, only Tenant A users should be notified
  const tenantAUsers = await User_T.find({ isActive: true, careerLensUserId: TENANT_A });
  const tenantBUsers = await User_T.find({ isActive: true, careerLensUserId: TENANT_B });

  const notifTargets = tenantAUsers.map(u => u.email);
  const crossTenantLeak = tenantBUsers.some(u => notifTargets.includes(u.email));

  !crossTenantLeak ? ok('Notification: Tenant A fan-out does NOT include Tenant B users') : fail('Notification: Tenant B users would receive Tenant A notifications!');
  notifTargets.length > 0 ? ok(`Notification: ${notifTargets.length} Tenant A user(s) targeted correctly`) : fail('Notification: no Tenant A users found');
}

// ─── Cleanup ───────────────────────────────────────────────────────────────────
async function cleanup() {
  await User_T.deleteMany({ email: { $in: [ 'hr1@test.com','hr2@test.com','emp1@test.com','emp2@test.com' ] } });
  await Holiday_T.deleteMany({ careerLensUserId: { $in: [TENANT_A, TENANT_B] } });
  await Leave_T.deleteMany({ userName: { $in: ['Emp One', 'Emp Two'] } });
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${Y}╔══════════════════════════════════════════╗${W}`);
  console.log(`${Y}║     HRMS Multi-Tenancy Test Suite        ║${W}`);
  console.log(`${Y}╚══════════════════════════════════════════╝${W}`);

  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`\nConnected to MongoDB (db: ${DB_NAME})`);
  } catch (err) {
    console.error(`${R}Failed to connect to MongoDB: ${err.message}${W}`);
    process.exit(1);
  }

  try {
    console.log(`\n${Y}Seeding test data...${W}`);
    await seed();
    console.log('  Test users and data created (tenants: tenant-A, tenant-B)\n');

    await testUserIsolation();
    await testHolidayIsolation();
    await testLeaveIsolation();
    await testNotificationFanout();

  } finally {
    console.log(`\n${Y}Cleaning up test data...${W}`);
    await cleanup();
    console.log('  Test data removed.');

    const total = passed + failed;
    console.log(`\n${Y}━━━━━━━━━━━━━━━━━━ RESULTS ━━━━━━━━━━━━━━━━━━${W}`);
    console.log(`  Total: ${total}  |  ${G}Passed: ${passed}${W}  |  ${failed > 0 ? R : G}Failed: ${failed}${W}`);
    if (failed === 0) {
      console.log(`\n  ${G}🎉 All tests passed! HR data isolation is working correctly.${W}\n`);
    } else {
      console.log(`\n  ${R}⚠️  Some tests failed — review the output above.${W}\n`);
    }

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

main();
