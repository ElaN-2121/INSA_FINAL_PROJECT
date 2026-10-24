const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-fixes";
const OUT_DIR = "C:\\Users\\Flore\\.gemini\\antigravity\\brain\\e6756a79-6150-4a2e-944d-1ffa4f215b7d\\screenshots\\fixes";

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

async function main() {
  console.log("Authenticating for dashboards...");
  const regAuth = await login('registrar@aau.et', 'Registrar@123');
  const empAuth = await login('employer@company.com', 'Employer@123');
  console.log("Logins complete.");

  console.log("Launching Chrome...");
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

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 1. Admin login while typing
    console.log("Capturing Admin Login while typing...");
    await client.send('Page.navigate', { url: 'http://localhost:5176/login' });
    await new Promise(r => setTimeout(r, 1500));

    // Type into fields and focus password input
    await client.send('Runtime.evaluate', {
      expression: `
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        if (emailInput) {
          emailInput.value = 'admin@ethiocred.et';
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (passInput) {
          passInput.focus();
          passInput.value = 'Admin@123SecureKey!';
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const adminLoginShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'admin-login-typing.png'), Buffer.from(adminLoginShot.data, 'base64'));
    console.log("Saved admin-login-typing.png");

    // 2. University Dashboard with StatCard labels
    console.log("Capturing University Dashboard...");
    await client.send('Page.navigate', { url: 'http://localhost:5174/dashboard' });
    await new Promise(r => setTimeout(r, 1000));
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('ethiocred_token', ${JSON.stringify(regAuth.token)});
        localStorage.setItem('ethiocred_user', JSON.stringify(${JSON.stringify(regAuth.user)}));
      `
    });
    await client.send('Page.navigate', { url: 'http://localhost:5174/dashboard' });
    await new Promise(r => setTimeout(r, 2200));

    const uniDashShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-dashboard-fixed.png'), Buffer.from(uniDashShot.data, 'base64'));
    console.log("Saved university-dashboard-fixed.png");

    // 3. Employer Dashboard with StatCard labels and helper line
    console.log("Capturing Employer Dashboard...");
    await client.send('Page.navigate', { url: 'http://localhost:5175/dashboard' });
    await new Promise(r => setTimeout(r, 1000));
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('ethiocred_token', ${JSON.stringify(empAuth.token)});
        localStorage.setItem('ethiocred_user', JSON.stringify(${JSON.stringify(empAuth.user)}));
      `
    });
    await client.send('Page.navigate', { url: 'http://localhost:5175/dashboard' });
    await new Promise(r => setTimeout(r, 2200));

    const empDashShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'employer-dashboard-fixed.png'), Buffer.from(empDashShot.data, 'base64'));
    console.log("Saved employer-dashboard-fixed.png");

    client.close();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    chrome.kill();
  }
}

main();
