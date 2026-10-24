// Original, lossless test pixels; never a tourism photograph or hosted upload.
import {deflateSync} from 'node:zlib'
const table=Array.from({length:256},(_,value)=>{let crc=value;for(let bit=0;bit<8;bit++)crc=(crc&1)?0xedb88320^(crc>>>1):crc>>>1;return crc>>>0})
function chunk(type,data){const name=Buffer.from(type),body=Buffer.concat([name,data]),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);let crc=0xffffffff;for(const byte of body)crc=table[(crc^byte)&255]^(crc>>>8);checksum.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([length,body,checksum])}
const width=1200,height=800,pixels=Buffer.alloc((width*3+1)*height),header=Buffer.alloc(13)
header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2
for(let y=0;y<height;y++)for(let x=0;x<width;x++){const offset=y*(width*3+1)+1+x*3;pixels[offset]=x%256;pixels[offset+1]=y%256;pixels[offset+2]=(x+y)%256}
export const syntheticImage=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))])
