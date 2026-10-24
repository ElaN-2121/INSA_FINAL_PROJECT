const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-phase3";
const OUT_DIR = "C:\\Users\\Flore\\.gemini\\antigravity\\brain\\e6756a79-6150-4a2e-944d-1ffa4f215b7d\\screenshots\\phase3";

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
  console.log("Authenticating as registrar@aau.et...");
  const regAuth = await login('registrar@aau.et', 'Registrar@123');
  console.log("Login successful.");

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

    // Inject Auth Token
    console.log("Injecting Auth token into university portal...");
    await client.send('Page.navigate', { url: 'http://localhost:5174/login' });
    await new Promise(r => setTimeout(r, 1500));

    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('ethiocred_token', '${regAuth.token}');
        localStorage.setItem('ethiocred_user', JSON.stringify(${JSON.stringify(regAuth.user)}));
      `
    });

    // 1. Capture University Dashboard with Department Insights section
    console.log("Navigating to University Dashboard...");
    await client.send('Page.navigate', { url: 'http://localhost:5174/dashboard' });
    await new Promise(r => setTimeout(r, 2500));

    const dashShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-dashboard-phase3.png'), Buffer.from(dashShot.data, 'base64'));
    console.log("Saved university-dashboard-phase3.png");

    // Scroll to Department Insights Section
    await client.send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 450);`
    });
    await new Promise(r => setTimeout(r, 800));
    const dashInsightsShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-dashboard-insights-section-phase3.png'), Buffer.from(dashInsightsShot.data, 'base64'));
    console.log("Saved university-dashboard-insights-section-phase3.png");

    // 2. Capture Dedicated Department Insights Page (/insights)
    console.log("Navigating to Dedicated Department Insights Page (/insights)...");
    await client.send('Page.navigate', { url: 'http://localhost:5174/insights' });
    await new Promise(r => setTimeout(r, 2500));

    const insightsShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-insights-phase3.png'), Buffer.from(insightsShot.data, 'base64'));
    console.log("Saved university-insights-phase3.png");

    // Scroll to see table and bar list
    await client.send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 500);`
    });
    await new Promise(r => setTimeout(r, 800));
    const insightsTableShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-insights-table-phase3.png'), Buffer.from(insightsTableShot.data, 'base64'));
    console.log("Saved university-insights-table-phase3.png");

    // 3. Mobile Viewport (375x812)
    console.log("Capturing Mobile Viewport (/insights)...");
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
    await new Promise(r => setTimeout(r, 800));
    const mobileShot = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'university-insights-mobile-phase3.png'), Buffer.from(mobileShot.data, 'base64'));
    console.log("Saved university-insights-mobile-phase3.png");

    client.close();
    console.log("All Phase 3 screenshots captured successfully.");
  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    chrome.kill();
  }
}

main();
