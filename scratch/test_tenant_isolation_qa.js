const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${data.message}`);
  }
  return data.data.token;
}

let passed = 0;
let failed = 0;

function report(testName, ok, details = '') {
  if (ok) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}: ${details}`);
    failed++;
  }
}

async function runQA() {
  console.log('====================================================');
  console.log('   ETHIOCRED ANALYTICS QA & TENANT ISOLATION SUITE  ');
  console.log('====================================================\n');

  // 1. Authenticate test identities
  console.log('1. Authenticating test identities...');
  const studentToken = await login('student@example.com', 'Student@123');
  const universityToken = await login('registrar@aau.et', 'Registrar@123');
  const employerToken = await login('employer@company.com', 'Employer@123');
  console.log('   Successfully obtained JWT tokens for STUDENT, UNIVERSITY, and EMPLOYER roles.\n');

  // 2. RBAC Enforcement Tests (401 & 403)
  console.log('2. Testing Strict RBAC & Role Enforcement...');

  // Unauthenticated requests
  const noAuthUniv = await fetch(`${BASE_URL}/analytics/university/departments`);
  report('Unauthenticated request to /university/departments returns 401', noAuthUniv.status === 401);

  const noAuthEmp = await fetch(`${BASE_URL}/analytics/employer/candidates`);
  report('Unauthenticated request to /employer/candidates returns 401', noAuthEmp.status === 401);

  const noAuthStud = await fetch(`${BASE_URL}/analytics/student/activity`);
  report('Unauthenticated request to /student/activity returns 401', noAuthStud.status === 401);

  // Student cross-role attempts
  const studToUniv = await fetch(`${BASE_URL}/analytics/university/departments`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  report('Student cannot access /university/departments (403 Forbidden)', studToUniv.status === 403);

  const studToEmp = await fetch(`${BASE_URL}/analytics/employer/candidates`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  report('Student cannot access /employer/candidates (403 Forbidden)', studToEmp.status === 403);

  // Employer cross-role attempts
  const empToUniv = await fetch(`${BASE_URL}/analytics/university/departments`, {
    headers: { Authorization: `Bearer ${employerToken}` },
  });
  report('Employer cannot access /university/departments (403 Forbidden)', empToUniv.status === 403);

  const empToStud = await fetch(`${BASE_URL}/analytics/student/activity`, {
    headers: { Authorization: `Bearer ${employerToken}` },
  });
  report('Employer cannot access /student/activity (403 Forbidden)', empToStud.status === 403);

  // University cross-role attempts
  const univToEmp = await fetch(`${BASE_URL}/analytics/employer/candidates`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  report('University cannot access /employer/candidates (403 Forbidden)', univToEmp.status === 403);

  const univToStud = await fetch(`${BASE_URL}/analytics/student/activity`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  report('University cannot access /student/activity (403 Forbidden)', univToStud.status === 403);

  console.log('\n3. Testing University Differential Privacy & Aggregate Masking...');
  const univRes = await fetch(`${BASE_URL}/analytics/university/departments`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  const univData = await univRes.json();
  report('University endpoint returns 200 OK', univRes.status === 200 && univData.success === true);

  const departments = univData.data?.departments || [];
  report('Departments list is populated', departments.length > 0);

  // Privacy: No individual student or employer names leaked
  const jsonStr = JSON.stringify(univData.data);
  const leaksStudentName = jsonStr.includes('Abebe') || jsonStr.includes('Tigist') || jsonStr.includes('Dawit');
  const leaksEmployerName = jsonStr.includes('Ethio Telecom') || jsonStr.includes('Commercial Bank') || jsonStr.includes('Safaricom');
  report('University payload does NOT leak student personal names', !leaksStudentName);
  report('University payload does NOT leak employer organization names', !leaksEmployerName);

  // Privacy: <3 masking on low volume counts
  const hasMaskedCategory = departments.some(
    (d) =>
      d.credentials_issued_display === '<3' ||
      d.active_credentials_display === '<3' ||
      d.revoked_credentials_display === '<3' ||
      d.times_verified_display === '<3' ||
      d.consent_requests_display === '<3'
  );
  report('Low-volume categories (< 3 events) are masked with "<3"', hasMaskedCategory);

  // Highlights calculated
  report('University highlights (most verified, highest approval) computed', !!univData.data?.highlights?.most_verified);

  console.log('\n4. Testing Employer Candidate Pipeline Tenant Scoping...');
  const empRes = await fetch(`${BASE_URL}/analytics/employer/candidates`, {
    headers: { Authorization: `Bearer ${employerToken}` },
  });
  const empData = await empRes.json();
  report('Employer endpoint returns 200 OK', empRes.status === 200 && empData.success === true);

  const pipelineTotals = empData.data?.pipeline_totals;
  report('Employer pipeline totals computed', pipelineTotals?.requests_sent > 0 && typeof pipelineTotals.approval_rate === 'number');

  const candidates = empData.data?.candidates || [];
  report('Candidates list populated for authorized employer', candidates.length > 0);

  // All candidates in candidate directory have status and serial
  const validCandidateRecords = candidates.every((c) => c.candidate_name && c.serial_number && c.status);
  report('All candidate records contain required fields (name, serial, status)', validCandidateRecords);

  console.log('\n5. Testing Student Sovereign Access Log Scoping...');
  const studRes = await fetch(`${BASE_URL}/analytics/student/activity`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studData = await studRes.json();
  report('Student endpoint returns 200 OK', studRes.status === 200 && studData.success === true);

  const requestsSummary = studData.data?.requests_summary;
  report('Student requests summary computed', requestsSummary?.received > 0 && typeof requestsSummary.approval_rate === 'number');

  const verificationsSummary = studData.data?.verifications_summary;
  report('Student verifications summary computed', verificationsSummary?.total_verifications > 0);

  const accessLog = studData.data?.access_log || [];
  report('Student access log contains unified consent & verification records', accessLog.length > 0);

  const hasConsentEvent = accessLog.some((l) => l.event_type === 'CONSENT_REQUEST');
  const hasVerificationEvent = accessLog.some((l) => l.event_type === 'VERIFICATION_CHECK');
  report('Student access log includes CONSENT_REQUEST events', hasConsentEvent);
  report('Student access log includes VERIFICATION_CHECK events', hasVerificationEvent);

  console.log('\n6. Testing Input Sanitization & Date Range Validation...');
  const invalidDateRes = await fetch(`${BASE_URL}/analytics/university/departments?from=invalid-date`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  report('Invalid date format returns 400 Bad Request', invalidDateRes.status === 400);

  const reversedDateRes = await fetch(`${BASE_URL}/analytics/university/departments?from=2026-12-01&to=2026-01-01`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  report('Reversed date range (from > to) returns 400 Bad Request', reversedDateRes.status === 400);

  const validDateRes = await fetch(`${BASE_URL}/analytics/university/departments?from=2026-01-01&to=2026-10-24`, {
    headers: { Authorization: `Bearer ${universityToken}` },
  });
  report('Valid ISO date range returns 200 OK', validDateRes.status === 200);

  console.log('\n====================================================');
  console.log(`QA SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runQA().catch((err) => {
  console.error('Unhandled QA Error:', err);
  process.exit(1);
});
