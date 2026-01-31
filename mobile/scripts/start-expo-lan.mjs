#!/usr/bin/env node
// Start Expo with forced LAN hostname resolution, especially for Windows
// Detects a non-internal IPv4 and sets REACT_NATIVE_PACKAGER_HOSTNAME/EXPO_PACKAGER_HOSTNAME
// Allows override via LAN_IP env var

import os from 'node:os';
import { spawn } from 'node:child_process';

function getLanIp() {
  // Manual override takes precedence
  const override = process.env.LAN_IP?.trim();
  if (override) return override;

  const ifaces = os.networkInterfaces();
  const candidates = [];
  for (const [name, infos] of Object.entries(ifaces)) {
    if (!Array.isArray(infos)) continue;
    for (const info of infos) {
      if (!info || info.internal) continue; // skip loopback/virtual internal
      if (info.family !== 'IPv4') continue; // prefer IPv4 for Expo QR
      const addr = info.address;
      if (!addr) continue;
      if (addr.startsWith('127.')) continue; // loopback
      if (addr.startsWith('169.254.')) continue; // link-local APIPA
      candidates.push({ name, address: addr });
    }
  }
  return candidates.length > 0 ? candidates[0].address : undefined;
}

function failNoIp() {
  // Clear and helpful message
  const msg = [
    '[Expo LAN] Não foi possível detectar um IPv4 de LAN válido automaticamente.',
    'Motivo comum no Windows: falha na resolução de rede, caindo em localhost.',
    '',
    'Soluções:',
    '- Tente informar manualmente: LAN_IP=192.168.x.x pnpm start',
    '- Ou use o fallback via túnel: pnpm run start:tunnel',
  ].join('\n');
  console.error(msg);
  process.exitCode = 1;
}

const ip = getLanIp();
if (!ip) {
  failNoIp();
  process.exit(1);
} else {
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = ip;
  // Set also EXPO_PACKAGER_HOSTNAME for older/newer Expo variants that read it
  process.env.EXPO_PACKAGER_HOSTNAME = ip;
  console.log(`[Expo LAN] Detected LAN IPv4: ${ip}`);
  console.log('[Expo LAN] Definindo REACT_NATIVE_PACKAGER_HOSTNAME e EXPO_PACKAGER_HOSTNAME...');
}

// Start Expo only when we have a valid LAN IP
const args = ['start', '--host', 'lan', '--clear'];
const child = spawn('expo', args, {
  stdio: 'inherit',
  env: process.env,
  // Use a shell to improve cross-platform resolution of local binaries (node_modules/.bin)
  shell: true,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[Expo LAN] Processo encerrado por sinal: ${signal}`);
    process.exit(1);
  } else {
    process.exit(code ?? 0);
  }
});
