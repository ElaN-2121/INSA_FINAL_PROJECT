const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-audit";

const URLS = [
  'http://localhost:5173/',
  'http://localhost:5173/login',
  'http://localhost:5174/',
  'http://localhost:5174/login',
  'http://localhost:5175/',
  'http://localhost:5175/login',
  'http://localhost:5176/login'
];

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
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
        } else if (data.method) {
          this.events.push(data);
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

async function audit() {
  console.log("Launching Chrome for console error audit...");
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${USER_DATA}`,
    '--remote-debugging-port=9222',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let totalErrors = 0;

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page') || pages[0];
    const client = new CDPClient(page.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');

    for (const url of URLS) {
      const pageErrors = [];
      client.events = [];

      await client.send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 1200));

      const errors = client.events.filter(e => 
        e.method === 'Runtime.exceptionThrown' ||
        (e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
      );

      if (errors.length > 0) {
        console.log(`[FAIL] ${url}: ${errors.length} error(s)`);
        errors.forEach(e => console.log('   ', JSON.stringify(e)));
        totalErrors += errors.length;
      } else {
        console.log(`[PASS] ${url}: 0 errors`);
      }
    }

    client.close();
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    chrome.kill();
  }

  console.log(`\nAudit complete. Total errors found: ${totalErrors}`);
}

audit();
