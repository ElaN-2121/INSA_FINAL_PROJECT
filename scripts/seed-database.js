// Change '..' to '..', 'backend', '.env' so it dives into the backend directory
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const ROOT = path.join(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'database', 'schema.sql');
const SEED_PATH = path.join(ROOT, 'database', 'seed.sql');
const MIGRATIONS_DIR = path.join(ROOT, 'database', 'migrations');
const MIGRATION_FILES = [
  'add_share_links.sql',
  'add_api_keys.sql',
  'add_missing_indexes.sql',
];

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const PASSWORDS = {
  '{{ADMIN_PASSWORD_HASH}}': 'Admin@123',
  '{{REGISTRAR_PASSWORD_HASH}}': 'Registrar@123',
  '{{STUDENT_PASSWORD_HASH}}': 'Student@123',
  '{{EMPLOYER_PASSWORD_HASH}}': 'Employer@123',
};

async function runSqlFile(client, filePath, replacements = {}) {
  let sql = fs.readFileSync(filePath, 'utf8');
  for (const [placeholder, plainPassword] of Object.entries(replacements)) {
    const hash = await bcrypt.hash(plainPassword, 12);
    sql = sql.split(placeholder).join(hash);
  }
  await client.query(sql);
}

async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');

    console.log('Running schema.sql...');
    await runSqlFile(client, SCHEMA_PATH);
    console.log('Schema applied successfully.');

    for (const file of MIGRATION_FILES) {
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      console.log(`Running migration: ${file}...`);
      await runSqlFile(client, migrationPath);
      console.log(`Migration ${file} applied successfully.`);
    }

    console.log('Running seed.sql with bcrypt password hashing...');
    await runSqlFile(client, SEED_PATH, PASSWORDS);
    console.log('Seed data inserted successfully.');

    console.log('\nSeed accounts:');
    console.log('  Admin:     admin@ethiocred.et     / Admin@123');
    console.log('  Registrar: registrar@aau.et       / Registrar@123');
    console.log('  Student:   student@example.com   / Student@123');
    console.log('  Employer:  employer@company.com   / Employer@123');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
