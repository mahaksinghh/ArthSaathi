import { decodeQrPixels } from './qr-decode.js';

self.onmessage = ({data})=>{
  try { self.postMessage({codes:decodeQrPixels(data)}); }
  catch { self.postMessage({failed:true}); }
};
