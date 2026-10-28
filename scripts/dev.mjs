// `npm run dev`: starts the API server and the Vite frontend together, and stops both on exit.
import { spawn } from 'node:child_process';
import process from 'node:process';

const processes = [
  { name: 'api', color: '\x1b[33m', args: ['backend/server.js'], node: true },
  { name: 'web', color: '\x1b[36m', args: ['node_modules/vite/bin/vite.js', '--config', 'frontend/vite.config.js'], node: true },
];

const children = processes.map(({ name, color, args }) => {
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  const prefix = `${color}[${name}]\x1b[0m `;
  const forward = (stream, target) =>
    stream.on('data', (chunk) => {
      chunk.toString().split(/\r?\n/).filter(Boolean).forEach((line) => target.write(`${prefix}${line}\n`));
    });
  forward(child.stdout, process.stdout);
  forward(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`${prefix}exited with code ${code}; stopping.`);
      shutdown(code);
    }
  });
  return child;
});

function shutdown(code = 0) {
  children.forEach((child) => !child.killed && child.kill());
  process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
