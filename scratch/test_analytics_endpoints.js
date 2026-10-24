async function login(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login failed for ${email}`);
  return data.data.token;
}

async function testEndpoint(name, url, token, expectedStatus = 200) {
  const res = await fetch(`http://localhost:5000${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  const passed = res.status === expectedStatus;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} (Status: ${res.status}, Expected: ${expectedStatus})`);
  if (!passed || expectedStatus === 200) {
    console.log('   Data preview:', JSON.stringify(json).slice(0, 300) + '...');
  }
  return json;
}

async function main() {
  console.log('--- Testing Phase 1 Analytics Endpoints ---\n');

  console.log('1. Logging in users...');
  const regToken = await login('registrar@aau.et', 'Registrar@123');
  const empToken = await login('employer@company.com', 'Employer@123');
  const studToken = await login('student@example.com', 'Student@123');
  console.log('   Tokens obtained successfully.\n');

  console.log('2. Testing Authorized Endpoints:');
  // University
  await testEndpoint('GET /api/analytics/university/departments', '/api/analytics/university/departments', regToken);
  await testEndpoint('GET /api/analytics/university/departments?sort=issued', '/api/analytics/university/departments?sort=issued', regToken);
  await testEndpoint('GET /api/analytics/university/departments?from=2020-01-01&to=2026-12-31', '/api/analytics/university/departments?from=2020-01-01&to=2026-12-31', regToken);
  await testEndpoint('GET /api/analytics/university/trend', '/api/analytics/university/trend', regToken);
  await testEndpoint('GET /api/analytics/university/trend?department=Computer%20Science', '/api/analytics/university/trend?department=Computer%20Science', regToken);

  // Employer
  await testEndpoint('GET /api/analytics/employer/candidates', '/api/analytics/employer/candidates', empToken);

  // Student
  await testEndpoint('GET /api/analytics/student/activity', '/api/analytics/student/activity', studToken);

  console.log('\n3. Testing Authorization Restrictions (Forbidden 403 checks):');
  // Student trying university endpoint -> 403
  await testEndpoint('Student accessing University departments', '/api/analytics/university/departments', studToken, 403);
  // Employer trying university trend -> 403
  await testEndpoint('Employer accessing University trend', '/api/analytics/university/trend', empToken, 403);
  // University trying employer candidates -> 403
  await testEndpoint('University accessing Employer candidates', '/api/analytics/employer/candidates', regToken, 403);
  // Employer trying student activity -> 403
  await testEndpoint('Employer accessing Student activity', '/api/analytics/student/activity', empToken, 403);

  console.log('\n4. Testing Input Date Validation:');
  await testEndpoint('Invalid from date format', '/api/analytics/university/departments?from=not-a-date', regToken, 400);
  await testEndpoint('From date after to date', '/api/analytics/university/departments?from=2026-12-31&to=2020-01-01', regToken, 400);

  console.log('\n--- All Analytics Endpoint Tests Completed ---');
}

main().catch(console.error);
