import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const processes = [
  spawn('node', ['server.js'], { stdio: 'inherit', shell: isWindows }),
  spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: isWindows }),
];

function shutdown() {
  for (const child of processes) child.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
