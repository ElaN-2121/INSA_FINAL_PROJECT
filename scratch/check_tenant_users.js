const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

async function checkUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const employers = await client.query("SELECT id, email, full_name, role, company_name FROM users WHERE role = 'EMPLOYER'");
  console.log('Employers:', employers.rows);

  const registrars = await client.query("SELECT u.id, u.email, u.full_name, u.role, u.institution_id, i.name as inst_name FROM users u JOIN institutions i ON i.id = u.institution_id WHERE u.role = 'UNIVERSITY'");
  console.log('Registrars:', registrars.rows);

  const students = await client.query("SELECT id, email, full_name, role FROM users WHERE role = 'STUDENT' LIMIT 6");
  console.log('Students:', students.rows);

  await client.end();
}
checkUsers();
