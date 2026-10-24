const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-phase5-analytics";
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

async function main() {
  console.log("Authenticating as student@example.com...");
  const studAuth = await login('student@example.com', 'Student@123');
  console.log("Login successful:", studAuth.user.full_name);

  console.log("Launching Headless Chrome...");
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

    // Desktop viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Inject Auth Token into student wallet
    console.log("Injecting Auth token into student wallet...");
    await client.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise(r => setTimeout(r, 1500));

    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('ethiocred_token', '${studAuth.token}');
        localStorage.setItem('ethiocred_user', JSON.stringify(${JSON.stringify(studAuth.user)}));
      `
    });

    // 1. Capture Student Dashboard (showing the new Privacy & Activity Center section)
    console.log("Navigating to Student Wallet Dashboard...");
    await client.send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
    await new Promise(r => setTimeout(r, 2500));

    // Scroll down to the Privacy & Activity Center section
    await client.send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 420);`
    });
    await new Promise(r => setTimeout(r, 800));

    const dashActivityShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'wallet-dashboard-activity-section-phase5.png'), Buffer.from(dashActivityShot.data, 'base64'));
    console.log("Saved wallet-dashboard-activity-section-phase5.png");

    // 2. Capture Dedicated Privacy & Activity Page (/activity)
    console.log("Navigating to Dedicated Privacy & Activity Page (/activity)...");
    await client.send('Page.navigate', { url: 'http://localhost:5173/activity' });
    await new Promise(r => setTimeout(r, 2500));

    const activityShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'wallet-activity-page-phase5.png'), Buffer.from(activityShot.data, 'base64'));
    console.log("Saved wallet-activity-page-phase5.png");

    // 3. Scroll to see Chronological Access & Verification Audit Trail
    await client.send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 780);`
    });
    await new Promise(r => setTimeout(r, 800));

    const auditLogShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'wallet-activity-audit-log-phase5.png'), Buffer.from(auditLogShot.data, 'base64'));
    console.log("Saved wallet-activity-audit-log-phase5.png");

    // 4. Mobile Viewport (375x812) on /activity
    console.log("Capturing Mobile Viewport (/activity)...");
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
    await new Promise(r => setTimeout(r, 800));

    const mobileShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'wallet-activity-mobile-phase5.png'), Buffer.from(mobileShot.data, 'base64'));
    console.log("Saved wallet-activity-mobile-phase5.png");

    client.close();
    console.log("All Phase 5 screenshots captured successfully.");
  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    chrome.kill();
  }
}

main();
