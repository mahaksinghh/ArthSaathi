import { decodeQrPixels } from '../public/qr-decode.js';
import { assessQr } from '../public/qr-risk.js';

const report={images:0, legacyReads:0, assistedReads:0, readsAllPayloadTypes:{}, additionalDecodedImages:0};
const header=Buffer.alloc(8);
let headerOffset=0;
let pixelOffset=0;
let data;
let width;
let height;
for await(const chunk of process.stdin) {
  let offset=0;
  while(offset<chunk.length) {
    if(!data) {
      const bytes=Math.min(8-headerOffset,chunk.length-offset);
      chunk.copy(header,headerOffset,offset,offset+bytes);
      headerOffset+=bytes;
      offset+=bytes;
      if(headerOffset<8) continue;
      width=header.readUInt32BE(0);
      height=header.readUInt32BE(4);
      if(!width||!height||width>1600||height>1600) throw Error('Invalid image dimensions');
      data=new Uint8ClampedArray(width*height*4);
    }
    const bytes=Math.min(data.length-pixelOffset,chunk.length-offset);
    data.set(chunk.subarray(offset,offset+bytes),pixelOffset);
    pixelOffset+=bytes;
    offset+=bytes;
    if(pixelOffset!==data.length) continue;
    const image={data,width,height};
    const direct=decodeQrPixels(image,{limit:1,enhanced:false});
    const result=direct.length?direct:decodeQrPixels(image,{limit:1});
    report.images++;
    if(direct.length) report.legacyReads++;
    if(result.length) {
      report.assistedReads++;
      const type=assessQr(result[0]).type;
      report.readsAllPayloadTypes[type]=(report.readsAllPayloadTypes[type]||0)+1;
      if(!direct.length) report.additionalDecodedImages++;
    }
    data=null;
    pixelOffset=0;
    headerOffset=0;
  }
}
if(data || headerOffset) throw Error('Truncated image data');
console.log(JSON.stringify(report));
