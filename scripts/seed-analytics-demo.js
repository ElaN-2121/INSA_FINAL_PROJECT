/**
 * DEMO ANALYTICS SEED RUNNER
 * 
 * Inserts realistic demo verification requests and verification logs
 * across multiple universities, departments, employers, and calendar months.
 * 
 * This script is for development and demonstration purposes only.
 * It is never run automatically during application builds or startup.
 * 
 * Usage:
 *   node scripts/seed-analytics-demo.js
 *   or:
 *   npm run seed:analytics-demo
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DEMO_SQL_PATH = path.join(__dirname, '..', 'database', 'seed-analytics-demo.sql');

async function runDemoSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }

  console.log('--- EthioCred Demo Analytics Seeder ---');
  console.log('Target database:', databaseUrl.split('@')[1] || databaseUrl);
  console.log('Loading demo SQL:', DEMO_SQL_PATH);

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');

    const sql = fs.readFileSync(DEMO_SQL_PATH, 'utf8');
    await client.query(sql);

    console.log('\n[SUCCESS] Analytics demo data successfully seeded!');
    console.log('Demo accounts enriched:');
    console.log('  - University Portal: registrar@aau.et (AAU departments & verification trends)');
    console.log('  - Employer Portal:   employer@company.com (Ethio Telecom talent pipeline & candidate insights)');
    console.log('  - Student Wallet:    student@example.com (Abebe Kebede verification & access audit logs)');
    console.log('\nYou can now preview meaningful charts and metrics across all role-specific portals.');
  } catch (err) {
    console.error('[ERROR] Demo seeding failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runDemoSeed();
