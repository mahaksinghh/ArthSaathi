import jsQR from './vendor/jsqr.js';

export const MAX_QR_CODES = 4;

// The decoder receives only local RGBA pixels and never opens decoded content.
function scan(image) {
  return jsQR(image.data, image.width, image.height, { inversionAttempts:'attemptBoth' });
}

function crop(image, left, top, width, height, border = 0) {
  const outWidth = width + 2 * border;
  const outHeight = height + 2 * border;
  const data = new Uint8ClampedArray(outWidth * outHeight * 4).fill(255);
  for(let y=0; y<height; y++) {
    const index = ((top+y)*image.width+left)*4;
    data.set(image.data.subarray(index,index+width*4), ((y+border)*outWidth+border)*4);
  }
  return {data,width:outWidth,height:outHeight};
}

function contrastCopy(image) {
  const histogram=new Uint32Array(256);
  let count=0;
  for(let i=0;i<image.data.length;i+=20) {
    const red=image.data[i], green=image.data[i+1], blue=image.data[i+2];
    histogram[(red*77+green*150+blue*29)>>8]++;
    count++;
  }
  let min=0, max=255;
  let dark=0, light=0;
  const cutoff=count*.025;
  while(min<254 && dark+histogram[min]<cutoff) dark+=histogram[min++];
  while(max>min+1 && light+histogram[max]<cutoff) light+=histogram[max--];
  if(max-min<8 || max-min>215) return null;
  const data=new Uint8ClampedArray(image.data.length);
  const factor=255/(max-min);
  for(let i=0;i<data.length;i+=4) {
    data[i]=(image.data[i]-min)*factor;
    data[i+1]=(image.data[i+1]-min)*factor;
    data[i+2]=(image.data[i+2]-min)*factor;
    data[i+3]=255;
  }
  return {...image,data};
}

const corners = ['topLeftCorner','topRightCorner','bottomRightCorner','bottomLeftCorner'];
function findCode(image, enhanced) {
  const raw = scan(image);
  if(raw || !enhanced) return raw;
  const {width,height} = image;
  // A white quiet zone helps images whose outer margin was cropped.
  const border = Math.max(8, Math.round(Math.min(width,height)*.025));
  const padded = scan(crop(image,0,0,width,height,border));
  if(padded) {
    for (const key of corners) {
      padded.location[key].x -= border;
      padded.location[key].y -= border;
    }
    return padded;
  }
  const contrasted=contrastCopy(image);
  const boosted=contrasted&&scan(contrasted);
  if(boosted) return boosted;
  // Full-width or full-height strips preserve codes that span half of the image.
  const w = Math.round(width*.68);
  const h = Math.round(height*.68);
  if (w < 30 || h < 30) return null;
  const stripWidth=Math.round(width*.56), stripHeight=Math.round(height*.56);
  const columns=[[0,0,stripWidth,height],[width-stripWidth,0,stripWidth,height]];
  const rows=[[0,0,width,stripHeight],[0,height-stripHeight,width,stripHeight]];
  const squares=[[0,0,w,h],[width-w,0,w,h],[0,height-h,w,h],[width-w,height-h,w,h],
    [Math.floor((width-w)/2),Math.floor((height-h)/2),w,h]];
  const regions=width>=height?[...columns,...rows,...squares]:[...rows,...columns,...squares];
  for (const [left,top,regionWidth,regionHeight] of regions) {
    const found = scan(crop(image,left,top,regionWidth,regionHeight));
    if(!found) continue;
    for (const key of corners) {
      found.location[key].x += left;
      found.location[key].y += top;
    }
    return found;
  }
  return null;
}

function maskCode(image, location) {
  const points = corners.map(key=>location[key]);
  const left = Math.max(0,Math.floor(Math.min(...points.map(p=>p.x)))-2);
  const right = Math.min(image.width,Math.ceil(Math.max(...points.map(p=>p.x)))+2);
  const top = Math.max(0,Math.floor(Math.min(...points.map(p=>p.y)))-2);
  const bottom = Math.min(image.height,Math.ceil(Math.max(...points.map(p=>p.y)))+2);
  if (left>=right || top>=bottom) return false;
  for(let y=top;y<bottom;y++) image.data.fill(255,(y*image.width+left)*4,(y*image.width+right)*4);
  return true;
}

export function decodeQrPixels(image, {limit=MAX_QR_CODES, enhanced=true}={}) {
  const pixels = limit>1 ? {...image,data:image.data.slice()} : image;
  const values = [];
  for(let i=0;i<limit;i++) {
    const found = findCode(pixels, enhanced);
    if(!found) break;
    if(!values.includes(found.data)) values.push(found.data);
    if(i+1===limit || !maskCode(pixels,found.location)) break;
  }
  return values;
}
