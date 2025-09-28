// autoCommit.js
// Jalankan dengan: node autoCommit.js
// Pastikan: repo sudah di-clone & remote "origin" siap push (pakai HTTPS).

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// === CONFIG ===
const REPO_DIR = "C:/path/to/my-dev-project"; // ganti ke path repo kamu (Windows) atau "/home/user/my-dev-project"
const FILES_TO_TOUCH = ["activity.log", "README.md"]; // file yang akan disentuh
// ==============

function run(cmd, cwd = REPO_DIR) {
  return execSync(cmd, { cwd, stdio: "inherit" });
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "");
}

function updateFiles() {
  const now = new Date().toISOString();
  // 1) Tambah baris ke activity.log
  const logPath = path.join(REPO_DIR, "activity.log");
  ensureFile(logPath);
  fs.appendFileSync(logPath, `Update: ${now}\n`);

  // 2) Opsional: tambahkan “heartbeat” ke README.md biar terlihat aktif tapi rapi
  const readmePath = path.join(REPO_DIR, "README.md");
  ensureFile(readmePath);
  const stamp = `\n<!-- heartbeat: ${now} -->\n`;
  fs.appendFileSync(readmePath, stamp);
}

function main() {
  updateFiles();
  run("git add .");
  // Commit message dengan timestamp ISO
  const msg = `auto: heartbeat ${new Date().toISOString()}`;
  run(`git commit -m "${msg}" || echo no changes to commit`);
  // Push ke main (ubah jika branch kamu berbeda)
  run("git push origin main");
}

main();
