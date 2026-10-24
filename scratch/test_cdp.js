const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Port and paths
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA = "C:\\Users\\Flore\\AppData\\Local\\Temp\\chrome-cdp-profile";

async function run() {
  console.log("Starting Chrome...");
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
    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const verData = await verRes.json();
    console.log("Connected to Chrome:", verData.Browser);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const listData = await listRes.json();
    console.log("Pages available:", listData.length);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    chrome.kill();
  }
}

run();
