import { StdioRpc } from '../dispatcher/adapters.mjs';
// Protocol handshake only. No thread, turn, model call, auth inspection or task dispatch.
const rpc = new StdioRpc(process.argv[2] || 'codex');
try {
  const response = await rpc.request('initialize', { clientInfo: { name: 'pelora_control', title: 'Pelora Control', version: '1.0.0' } });
  rpc.notify('initialized');
  console.log(JSON.stringify({ initialized: true, platformFamily: response.platformFamily ?? null, platformOs: response.platformOs ?? null }));
} finally { rpc.close(); }
