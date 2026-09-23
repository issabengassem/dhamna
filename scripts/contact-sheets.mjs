import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const dir=resolve('../verification',process.env.DHAMNA_RUN||'round-3');
const report=JSON.parse(await readFile(resolve(dir,'report.json'),'utf8'));
for(const device of ['desktop','phone','compact','reduced','interaction']){
  const files=report.screenshots.filter(n=>n.startsWith(device+'-'));
  if(!files.length)continue;
  const width=device==='desktop'||device==='reduced'||device==='interaction'?480:240;
  const height=device==='compact'?427:device==='phone'?520:334;
  const columns=3;
  const tiles=[];
  for(const [index,file] of files.entries()){
    const input=await sharp(resolve(dir,file)).resize(width,height,{fit:'contain',background:'#ddd8ca'}).png().toBuffer();
    tiles.push({input,left:(index%columns)*width,top:Math.floor(index/columns)*height});
  }
  await sharp({create:{width:width*columns,height:Math.ceil(files.length/columns)*height,channels:3,background:'#ddd8ca'}}).composite(tiles).png().toFile(resolve(dir,device+'-sheet.png'));
  console.log(resolve(dir,device+'-sheet.png'));
}
