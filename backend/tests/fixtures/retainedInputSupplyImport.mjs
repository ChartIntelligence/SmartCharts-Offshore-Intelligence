import http from 'node:http';import https from 'node:https';import net from 'node:net';import tls from 'node:tls';
const forbidden=()=>{throw Error('P2 import side effect');};globalThis.fetch=forbidden;http.request=forbidden;http.get=forbidden;https.request=forbidden;https.get=forbidden;net.connect=forbidden;net.createConnection=forbidden;tls.connect=forbidden;Date.now=forbidden;
await import('../../durableObserve/retainedInputSupply.mjs');
console.log('P2 module imported with network and implicit clock ports denied.');
