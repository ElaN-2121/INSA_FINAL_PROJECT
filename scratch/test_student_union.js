const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

async function testUnion() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const userRes = await client.query("SELECT id FROM users WHERE email = 'student@example.com'");
  const studentId = userRes.rows[0].id;

  const sql = `
    SELECT
      vr.id,
      'CONSENT_REQUEST' AS event_type,
      eu.full_name AS employer_name,
      eu.company_name AS employer_company,
      c.id AS credential_id,
      c.degree_name,
      c.serial_number,
      vr.status AS status,
      vr.requested_at AS timestamp,
      vr.responded_at
    FROM verification_requests vr
    JOIN users eu ON eu.id = vr.employer_id
    JOIN credentials c ON c.id = vr.credential_id
    WHERE vr.student_id = $1

    UNION ALL

    SELECT
      vl.id,
      'VERIFICATION_CHECK' AS event_type,
      COALESCE(eu.full_name, 'Verification Authority') AS employer_name,
      COALESCE(eu.company_name, 'Direct Verification Portal') AS employer_company,
      c.id AS credential_id,
      c.degree_name,
      c.serial_number,
      vl.result AS status,
      vl.checked_at AS timestamp,
      vl.checked_at AS responded_at
    FROM verification_logs vl
    JOIN credentials c ON c.id = vl.credential_id
    LEFT JOIN verification_requests vr ON vr.id = vl.request_id
    LEFT JOIN users eu ON eu.id = vr.employer_id
    WHERE c.holder_id = $1

    ORDER BY timestamp DESC
    LIMIT 60;
  `;

  const { rows } = await client.query(sql, [studentId]);
  console.log('Union total count:', rows.length);
  console.log('Events breakdown:', rows.reduce((acc, r) => { acc[r.event_type] = (acc[r.event_type] || 0) + 1; return acc; }, {}));
  console.log('Sample rows:', rows.slice(0, 4));
  await client.end();
}
testUnion();
