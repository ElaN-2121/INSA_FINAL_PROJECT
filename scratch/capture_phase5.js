const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-phase5";
const OUT_DIR = "C:\\Users\\Flore\\.gemini\\antigravity\\brain\\e6756a79-6150-4a2e-944d-1ffa4f215b7d\\screenshots\\phase5";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function login(email, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login failed for ${email}: ${data.message}`);
  return { token: data.data.token, user: data.data.user };
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureScreen(client, targetUrl, token, user, fileName, postAction = null) {
  console.log(`\nNavigating to ${targetUrl} for ${fileName}...`);
  
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false
  });

  await client.send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 1000));

  await client.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('ethiocred_token', ${JSON.stringify(token)});
      localStorage.setItem('ethiocred_user', JSON.stringify(${JSON.stringify(user)}));
    `
  });

  await client.send('Page.navigate', { url: targetUrl });
  await new Promise(r => setTimeout(r, 2000));

  if (postAction) {
    await client.send('Runtime.evaluate', { expression: postAction });
    await new Promise(r => setTimeout(r, 1200));
  }

  const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const filePath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  console.log(`Saved screenshot: ${filePath} (${Math.round(data.length * 0.75 / 1024)} KB)`);
}

async function main() {
  console.log("Authenticating users against backend...");
  const adminAuth = await login('admin@ethiocred.et', 'Admin@123');
  const regAuth = await login('registrar@aau.et', 'Registrar@123');
  const studAuth = await login('student@example.com', 'Student@123');
  const empAuth = await login('employer@company.com', 'Employer@123');
  console.log("All logins successful.");

  console.log("Launching headless Chrome...");
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${USER_DATA}`,
    '--remote-debugging-port=9222',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page') || pages[0];
    const client = new CDPClient(page.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');

    // 1. User Wallet
    await captureScreen(client, 'http://localhost:5173/dashboard', studAuth.token, studAuth.user, 'wallet-dashboard-phase5.png');
    await captureScreen(client, 'http://localhost:5173/credentials', studAuth.token, studAuth.user, 'wallet-credentials-phase5.png');
    await captureScreen(client, 'http://localhost:5173/notifications', studAuth.token, studAuth.user, 'wallet-notifications-phase5.png');

    // 2. University Portal
    await captureScreen(client, 'http://localhost:5174/dashboard', regAuth.token, regAuth.user, 'university-dashboard-phase5.png');
    await captureScreen(client, 'http://localhost:5174/credentials', regAuth.token, regAuth.user, 'university-issued-credentials-phase5.png');
    await captureScreen(client, 'http://localhost:5174/settings', regAuth.token, regAuth.user, 'university-settings-phase5.png');

    // 3. Employer Portal
    await captureScreen(client, 'http://localhost:5175/dashboard', empAuth.token, empAuth.user, 'employer-dashboard-phase5.png');
    await captureScreen(client, 'http://localhost:5175/history', empAuth.token, empAuth.user, 'employer-history-phase5.png');
    await captureScreen(client, 'http://localhost:5175/request-status', empAuth.token, empAuth.user, 'employer-request-status-phase5.png');

    // 4. Admin Portal
    await captureScreen(client, 'http://localhost:5176/dashboard', adminAuth.token, adminAuth.user, 'admin-dashboard-phase5.png');
    await captureScreen(client, 'http://localhost:5176/institutions', adminAuth.token, adminAuth.user, 'admin-institutions-phase5.png');
    await captureScreen(client, 'http://localhost:5176/audit-logs', adminAuth.token, adminAuth.user, 'admin-audit-logs-phase5.png');
    await captureScreen(client, 'http://localhost:5176/create-admin', adminAuth.token, adminAuth.user, 'admin-create-admin-phase5.png');

    client.close();
  } catch (err) {
    console.error("CDP automation error:", err);
  } finally {
    chrome.kill();
  }
}

main();
